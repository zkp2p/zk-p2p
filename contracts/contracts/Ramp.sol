//SPDX-License-Identifier: MIT

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { Bytes32ArrayUtils } from "./lib/Bytes32ArrayUtils.sol";
import { Uint256ArrayUtils } from "./lib/Uint256ArrayUtils.sol";

import { IPoseidon } from "./interfaces/IPoseidon.sol";
import { IReceiveProcessor } from "./interfaces/IReceiveProcessor.sol";
import { IRegistrationProcessor } from "./interfaces/IRegistrationProcessor.sol";
import { ISendProcessor } from "./interfaces/ISendProcessor.sol";

pragma solidity ^0.8.18;

contract Ramp is Ownable {

    using Bytes32ArrayUtils for bytes32[];
    using Uint256ArrayUtils for uint256[];

    /* ============ Events ============ */
    event AccountRegistered(address indexed accountOwner, bytes32 indexed venmoIdHash);
    event DepositReceived(
        uint256 indexed depositId,
        bytes32 indexed venmoId,
        uint256 amount,
        uint256 conversionRate
    );
    event IntentSignaled(
        bytes32 indexed intentHash,
        uint256 indexed depositId,
        bytes32 indexed venmoId,
        address to,
        uint256 amount,
        uint256 timestamp
    );

    event IntentPruned(
        bytes32 indexed intentHash,
        uint256 indexed depositId
    );
    // Do we want to emit the onRamper or the venmoId
    event IntentFulfilled(
        bytes32 indexed intentHash,
        uint256 indexed depositId,
        address indexed onRamper,
        address to,
        uint256 amount
    );
    // Do we want to emit the depositor or the venmoId
    event DepositWithdrawn(
        uint256 indexed depositId,
        address indexed depositor,
        uint256 amount
    );

    event DepositClosed(uint256 depositId, address depositor);
    event UserAddedToDenylist(bytes32 listOwner, bytes32 deniedUser);
    event UserRemovedFromDenylist(bytes32 listOwner, bytes32 approvedUser);
    event MinDepositAmountSet(uint256 minDepositAmount);
    event MaxOnRampAmountSet(uint256 maxOnRampAmount);
    event IntentExpirationPeriodSet(uint256 intentExpirationPeriod);
    event NewSendProcessorSet(address sendProcessor);
    event NewRegistrationProcessorSet(address registrationProcessor);
    event NewReceiveProcessorSet(address receiveProcessor);

    /* ============ Structs ============ */

    struct AccountInfo {
        bytes32 venmoIdHash;                // Poseidon hash of account's venmoId
        uint256[] deposits;                 // Array of open account deposits
    }

    struct Deposit {
        address depositor;
        uint256[3] packedVenmoId;
        uint256 depositAmount;              // Amount of USDC deposited
        uint256 remainingDeposits;          // Amount of remaining deposited liquidity
        uint256 outstandingIntentAmount;    // Amount of outstanding intents (may include expired intents)
        uint256 conversionRate;             // Conversion required by off-ramper between USDC/USD
        bytes32[] intentHashes;             // Array of hashes of all open intents (may include some expired if not pruned)
    }

    struct DepositWithAvailableLiquidity {
        uint256 depositId;                  // ID of the deposit
        Deposit deposit;                    // Deposit struct
        uint256 availableLiquidity;         // Amount of liquidity available to signal intents (net of expired intents)
    }

    struct Intent {
        address onRamper;                   // On-ramper's address
        address to;                         // Address to forward funds to (can be same as onRamper)
        uint256 deposit;                    // ID of the deposit the intent is signaling on
        uint256 amount;                     // Amount of USDC the on-ramper signals intent for on-chain
        uint256 intentTimestamp;            // Timestamp of when the intent was signaled
    }

    struct IntentWithOnRamperId {
        Intent intent;                      // Intent struct
        bytes32 onRamperIdHash;             // Poseidon hash of the on-ramper's venmoId
    }

    struct DenyList {
        bytes32[] deniedUsers;              // Array of venmoIdHashes that are denied from taking depositors liquidity
        mapping(bytes32 => bool) isDenied;  // Mapping of venmoIdHash to boolean indicating if the user is denied
    }

    /* ============ Modifiers ============ */
    modifier onlyRegisteredUser() {
        require(accounts[msg.sender].venmoIdHash != bytes32(0), "Caller must be registered user");
        _;
    }

    /* ============ Constants ============ */
    uint256 internal constant PRECISE_UNIT = 1e18;
    uint256 internal constant MAX_DEPOSITS = 5;       // An account can only have max 5 different deposit parameterizations to prevent locking funds
    uint256 constant CIRCOM_PRIME_FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    
    /* ============ State Variables ============ */
    IERC20 public immutable usdc;                               // USDC token contract
    IPoseidon public immutable poseidon;                        // Poseidon hashing contract
    IReceiveProcessor public receiveProcessor;                  // Address of receive processor contract verifies onRampWithReceiveEmail emails
    IRegistrationProcessor public registrationProcessor;        // Address of registration processor contract, verifies registration e-mails
    ISendProcessor public sendProcessor;                        // Address of send processor contract, verifies onRamp emails

    bool internal isInitialized;                                // Indicates if contract has been initialized

    mapping(bytes32 => DenyList) internal userDenylist;         // Mapping of venmoIdHash to user's deny list. User's on deny list cannot
                                                                // signal an intent on their deposit
    mapping(address => AccountInfo) internal accounts;
    mapping(bytes32 => bytes32) public venmoIdIntent;           // Mapping of venmoIdHash to intentHash, we limit one intent per venmoId
    mapping(uint256 => Deposit) public deposits;                // Mapping of depositIds to deposit structs
    mapping(bytes32 => Intent) public intents;                  // Mapping of intentHashes to intent structs

    uint256 public minDepositAmount;                            // Minimum amount of USDC that can be deposited
    uint256 public maxOnRampAmount;                             // Maximum amount of USDC that can be on-ramped in a single transaction
    uint256 public intentExpirationPeriod;                      // Time period after which an intent can be pruned from the system
    uint256 public depositCounter;                              // Counter for depositIds

    /* ============ Constructor ============ */
    constructor(
        address _owner,
        IERC20 _usdc,
        IPoseidon _poseidon,
        uint256 _minDepositAmount,
        uint256 _maxOnRampAmount,
        uint256 _intentExpirationPeriod
    )
        Ownable()
    {
        usdc = _usdc;
        poseidon = _poseidon;
        minDepositAmount = _minDepositAmount;
        maxOnRampAmount = _maxOnRampAmount;
        intentExpirationPeriod = _intentExpirationPeriod;

        transferOwnership(_owner);
    }

    /* ============ External Functions ============ */

    /**
     * @notice Initialize Ramp with the addresses of the Processors
     *
     * @param _receiveProcessor         Receive processor address
     * @param _registrationProcessor    Registration processor address
     * @param _sendProcessor            Send processor address
     */
    function initialize(
        IReceiveProcessor _receiveProcessor,
        IRegistrationProcessor _registrationProcessor,
        ISendProcessor _sendProcessor
    )
        external
        onlyOwner
    {
        require(!isInitialized, "Already initialized");

        receiveProcessor = _receiveProcessor;
        registrationProcessor = _registrationProcessor;
        sendProcessor = _sendProcessor;

        isInitialized = true;
    }

    /**
     * @notice Registers a new account by pulling the hash of the account id from the proof and assigning the account owner to the
     * sender of the transaction. One venmo account can be registered to multiple Ethereum addresses.
     *
     * @param _a        Parameter of zk proof
     * @param _b        Parameter of zk proof
     * @param _c        Parameter of zk proof
     * @param _signals  Encoded public signals of the zk proof, contains mailserverHash, fromEmail, userIdHash
     */
    function register(
        uint[2] memory _a,
        uint[2][2] memory _b,
        uint[2] memory _c,
        uint[5] memory _signals
    )
        external
    {
        require(accounts[msg.sender].venmoIdHash == bytes32(0), "Account already associated with venmoId");
        bytes32 venmoIdHash = _verifyRegistrationProof(_a, _b, _c, _signals);

        accounts[msg.sender].venmoIdHash = venmoIdHash;

        emit AccountRegistered(msg.sender, venmoIdHash);
    }

    /**
     * @notice Generates a deposit entry for off-rampers that can then be fulfilled by an on-ramper. This function will not add to
     * previous deposits. Every deposit has it's own unique identifier. User must approve the contract to transfer the deposit amount
     * of USDC.
     *
     * @param _packedVenmoId    The packed venmo id of the account owner (we pack for easy use with poseidon)
     * @param _depositAmount    The amount of USDC to off-ramp
     * @param _receiveAmount    The amount of USD to receive
     */
    function offRamp(
        uint256[3] memory _packedVenmoId,
        uint256 _depositAmount,
        uint256 _receiveAmount
    )
        external
        onlyRegisteredUser
    {
        bytes32 venmoIdHash = bytes32(poseidon.poseidon(_packedVenmoId));

        require(accounts[msg.sender].venmoIdHash == venmoIdHash, "Sender must be the account owner");
        require(accounts[msg.sender].deposits.length < MAX_DEPOSITS, "Maximum deposit amount reached");
        require(_depositAmount >= minDepositAmount, "Deposit amount must be greater than min deposit amount");
        require(_receiveAmount > 0, "Receive amount must be greater than 0");

        uint256 conversionRate = (_depositAmount * PRECISE_UNIT) / _receiveAmount;
        uint256 depositId = depositCounter++;

        accounts[msg.sender].deposits.push(depositId);

        deposits[depositId] = Deposit({
            depositor: msg.sender,
            packedVenmoId: _packedVenmoId,
            depositAmount: _depositAmount,
            remainingDeposits: _depositAmount,
            outstandingIntentAmount: 0,
            conversionRate: conversionRate,
            intentHashes: new bytes32[](0)
        });

        usdc.transferFrom(msg.sender, address(this), _depositAmount);

        emit DepositReceived(depositId, venmoIdHash, _depositAmount, conversionRate);
    }

    /**
     * @notice Signals intent to pay the depositor defined in the _depositId the _amount * deposit conversionRate off-chain
     * in order to unlock _amount of funds on-chain. Each user can only have one outstanding intent at a time regardless of
     * address (tracked using venmoId). Caller must not be on the depositor's deny list. If there are prunable intents then
     * they will be deleted from the deposit to be able to maintain state hygiene.
     *
     * @param _depositId    The ID of the deposit the on-ramper intends to use for 
     * @param _amount       The amount of USDC the user wants to on-ramp
     * @param _to           Address to forward funds to (can be same as onRamper)
     */
    function signalIntent(uint256 _depositId, uint256 _amount, address _to) external onlyRegisteredUser {
        bytes32 venmoIdHash = accounts[msg.sender].venmoIdHash;
        Deposit storage deposit = deposits[_depositId];
        bytes32 depositorVenmoIdHash = accounts[deposit.depositor].venmoIdHash;

        require(deposit.depositor != address(0), "Deposit does not exist");
        require(!userDenylist[depositorVenmoIdHash].isDenied[venmoIdHash], "Onramper on depositor's denylist");
        require(_amount > 0, "Signaled amount must be greater than 0");
        require(_amount <= maxOnRampAmount, "Signaled amount must be less than max on-ramp amount");
        require(accounts[deposit.depositor].venmoIdHash != accounts[msg.sender].venmoIdHash, "Sender cannot be the depositor");
        require(_to != address(0), "Cannot send to zero address");
        require(venmoIdIntent[venmoIdHash] == bytes32(0), "Intent still outstanding");

        bytes32 intentHash = _calculateIntentHash(venmoIdHash, _depositId);

        if (deposit.remainingDeposits < _amount) {
            (
                bytes32[] memory prunableIntents,
                uint256 reclaimableAmount
            ) = _getPrunableIntents(_depositId);

            require(deposit.remainingDeposits + reclaimableAmount >= _amount, "Not enough liquidity");

            _pruneIntents(deposit, prunableIntents);
            deposit.remainingDeposits += reclaimableAmount;
            deposit.outstandingIntentAmount -= reclaimableAmount;
        }

        intents[intentHash] = Intent({
            onRamper: msg.sender,
            to: _to,
            deposit: _depositId,
            amount: _amount,
            intentTimestamp: block.timestamp
        });

        venmoIdIntent[venmoIdHash] = intentHash;

        deposit.remainingDeposits -= _amount;
        deposit.outstandingIntentAmount += _amount;
        deposit.intentHashes.push(intentHash);

        emit IntentSignaled(intentHash, _depositId, venmoIdHash, _to, _amount, block.timestamp);
    }

    /**
     * @notice Only callable by the originator of the intent. Cancels an outstanding intent thus allowing user to signal a new
     * intent. Deposit state is updated to reflect the cancelled intent.
     *
     * @param _intentHash    Hash of intent being cancelled
     */
    function cancelIntent(bytes32 _intentHash) external {
        Intent memory intent = intents[_intentHash];
        
        require(intent.intentTimestamp != 0, "Intent does not exist");
        require(intent.onRamper == msg.sender, "Sender must be the on-ramper");

        Deposit storage deposit = deposits[intent.deposit];

        _pruneIntent(deposit, _intentHash);

        deposit.remainingDeposits += intent.amount;
        deposit.outstandingIntentAmount -= intent.amount;
    }

    /**
     * @notice ONLY OFF-RAMPER: Must be submitted by off-ramper. Upon submission the proof is validated, intent is removed,
     * and deposit state is updated. USDC is transferred to the on-ramper and the defined convenience fee is sent to the off-
     * ramper. THE OFF-RAMPER MUST VALIDATE THAT THE CORRECT AMOUNT OF USD WAS RECEIVED OFF-CHAIN, there is no validation for
     * that on-chain.
     *
     * @param _a        Parameter of zk proof
     * @param _b        Parameter of zk proof
     * @param _c        Parameter of zk proof
     * @param _signals  Encoded public signals of the zk proof, contains mailserverHash, fromEmail, timestamp, onRamperIdHash,
     *                  nullifier, intentHash
     */
    function onRampWithReceiveEmail(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[9] memory _signals
    )
        external
    {
        (
            Intent memory intent,
            bytes32 intentHash
        ) = _verifyOnRampWithReceiveEmailProof(_a, _b, _c, _signals);

        Deposit storage deposit = deposits[intent.deposit];

        require(deposit.depositor == msg.sender, "Sender must be the account owner");

        _pruneIntent(deposit, intentHash);

        deposit.outstandingIntentAmount -= intent.amount;
        _closeDepositIfNecessary(intent.deposit, deposit);

        usdc.transfer(intent.to, intent.amount);

        emit IntentFulfilled(intentHash, intent.deposit, intent.onRamper, intent.to, intent.amount);
    }

    /**
     * @notice Anyone can submit an on-ramp transaction, even if caller isn't on-ramper. Upon submission the proof is validated,
     * intent is removed, and deposit state is updated. USDC is transferred to the on-ramper.
     *
     * @param _a        Parameter of zk proof
     * @param _b        Parameter of zk proof
     * @param _c        Parameter of zk proof
     * @param _signals  Encoded public signals of the zk proof, contains mailserverHash, fromEmail, timestamp, onRamperIdHash,
     *                  nullifier, intentHash
     */
    function onRamp(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[10] memory _signals
    )
        external
    {
        (
            Intent memory intent,
            Deposit storage deposit,
            bytes32 intentHash
        ) = _verifyOnRampProof(_a, _b, _c, _signals);

        _pruneIntent(deposit, intentHash);

        deposit.outstandingIntentAmount -= intent.amount;
        _closeDepositIfNecessary(intent.deposit, deposit);

        usdc.transfer(intent.to, intent.amount);
        
        emit IntentFulfilled(intentHash, intent.deposit, intent.onRamper, intent.to, intent.amount);
    }

    /**
     * @notice Caller must be the depositor for each depositId in the array, if not whole function fails. Depositor is returned all
     * remaining deposits and any outstanding intents that are expired. If an intent is not expired then those funds will not be
     * returned. Deposit will be deleted as long as there are no more outstanding intents.
     *
     * @param _depositIds   Array of depositIds the depositor is attempting to withdraw
     */
    function withdrawDeposit(uint256[] memory _depositIds) external {
        uint256 returnAmount;

        for (uint256 i = 0; i < _depositIds.length; ++i) {
            uint256 depositId = _depositIds[i];
            Deposit storage deposit = deposits[depositId];

            require(deposit.depositor == msg.sender, "Sender must be the depositor");

            (
                bytes32[] memory prunableIntents,
                uint256 reclaimableAmount
            ) = _getPrunableIntents(depositId);

            _pruneIntents(deposit, prunableIntents);

            returnAmount += deposit.remainingDeposits + reclaimableAmount;
            
            deposit.outstandingIntentAmount -= reclaimableAmount;

            emit DepositWithdrawn(depositId, deposit.depositor, deposit.remainingDeposits + reclaimableAmount);
            
            delete deposit.remainingDeposits;
            _closeDepositIfNecessary(depositId, deposit);
        }

        usdc.transfer(msg.sender, returnAmount);
    }

    /**
     * @notice Adds a venmoId to a depositor's deny list. If an address associated with the banned venmoId attempts to
     * signal an intent on the user's deposit they will be denied.
     *
     * @param _deniedUser   Poseidon hash of the venmoId being banned
     */
    function addAccountToDenylist(bytes32 _deniedUser) external onlyRegisteredUser {
        bytes32 denyingUser = accounts[msg.sender].venmoIdHash;

        require(!userDenylist[denyingUser].isDenied[_deniedUser], "User already on denylist");

        userDenylist[denyingUser].isDenied[_deniedUser] = true;
        userDenylist[denyingUser].deniedUsers.push(_deniedUser);

        emit UserAddedToDenylist(denyingUser, _deniedUser);
    }

    /**
     * @notice Removes a venmoId from a depositor's deny list.
     *
     * @param _approvedUser   Poseidon hash of the venmoId being approved
     */
    function removeAccountFromDenylist(bytes32 _approvedUser) external onlyRegisteredUser {
        bytes32 approvingUser = accounts[msg.sender].venmoIdHash;

        require(userDenylist[approvingUser].isDenied[_approvedUser], "User not on denylist");

        userDenylist[approvingUser].isDenied[_approvedUser] = false;
        userDenylist[approvingUser].deniedUsers.removeStorage(_approvedUser);

        emit UserRemovedFromDenylist(approvingUser, _approvedUser);
    }

    /* ============ Governance Functions ============ */

    /**
     * @notice GOVERNANCE ONLY: Updates the send processor address used for validating and interpreting zk proofs.
     *
     * @param _sendProcessor   New send proccesor address
     */
    function setSendProcessor(ISendProcessor _sendProcessor) external onlyOwner {
        sendProcessor = _sendProcessor;
        emit NewSendProcessorSet(address(_sendProcessor));
    }

    /**
     * @notice GOVERNANCE ONLY: Updates the receive processor address used for validating and interpreting zk proofs.
     *
     * @param _receiveProcessor   New receive proccesor address
     */
    function setReceiveProcessor(IReceiveProcessor _receiveProcessor) external onlyOwner {
        receiveProcessor = _receiveProcessor;
        emit NewReceiveProcessorSet(address(_receiveProcessor));
    }

    /**
     * @notice GOVERNANCE ONLY: Updates the registration processor address used for validating and interpreting zk proofs.
     *
     * @param _registrationProcessor   New registration proccesor address
     */
    function setRegistrationProcessor(IRegistrationProcessor _registrationProcessor) external onlyOwner {
        registrationProcessor = _registrationProcessor;
        emit NewRegistrationProcessorSet(address(_registrationProcessor));
    }

    /**
     * @notice GOVERNANCE ONLY: Updates the minimum deposit amount a user can specify for off-ramping.
     *
     * @param _minDepositAmount   The new minimum deposit amount
     */
    function setMinDepositAmount(uint256 _minDepositAmount) external onlyOwner {
        require(_minDepositAmount != 0, "Minimum deposit cannot be zero");

        minDepositAmount = _minDepositAmount;
        emit MinDepositAmountSet(_minDepositAmount);
    }

    /**
     * @notice GOVERNANCE ONLY: Updates the max amount allowed to be on-ramped in each transaction. To on-ramp more than
     * this amount a user must make multiple transactions.
     *
     * @param _maxOnRampAmount   The new max on ramp amount
     */
    function setMaxOnRampAmount(uint256 _maxOnRampAmount) external onlyOwner {
        require(_maxOnRampAmount != 0, "Max on ramp amount cannot be zero");

        maxOnRampAmount = _maxOnRampAmount;
        emit MaxOnRampAmountSet(_maxOnRampAmount);
    }

    /**
     * @notice GOVERNANCE ONLY: Updates the intent expiration period, after this period elapses an intent can be pruned to prevent
     * locking up a depositor's funds.
     *
     * @param _intentExpirationPeriod   New intent expiration period
     */
    function setIntentExpirationPeriod(uint256 _intentExpirationPeriod) external onlyOwner {
        require(_intentExpirationPeriod != 0, "Max intent expiration period cannot be zero");

        intentExpirationPeriod = _intentExpirationPeriod;
        emit IntentExpirationPeriodSet(_intentExpirationPeriod);
    }


    /* ============ External View Functions ============ */

    function getDeposit(uint256 _depositId) external view returns (Deposit memory) {
        return deposits[_depositId];
    }

    function getAccountInfo(address _account) external view returns (AccountInfo memory) {
        return accounts[_account];
    }

    function getDeniedUsers(address _account) external view returns (bytes32[] memory) {
        return userDenylist[accounts[_account].venmoIdHash].deniedUsers;
    }

    function isDeniedUser(address _account, bytes32 _deniedUser) external view returns (bool) {
        return userDenylist[accounts[_account].venmoIdHash].isDenied[_deniedUser];
    }

    function getIntentsWithOnRamperId(bytes32[] calldata _intentHashes) external view returns (IntentWithOnRamperId[] memory) {
        IntentWithOnRamperId[] memory intentsWithOnRamperId = new IntentWithOnRamperId[](_intentHashes.length);

        for (uint256 i = 0; i < _intentHashes.length; ++i) {
            Intent memory intent = intents[_intentHashes[i]];
            intentsWithOnRamperId[i] = IntentWithOnRamperId({
                intent: intent,
                onRamperIdHash: accounts[intent.onRamper].venmoIdHash
            });
        }

        return intentsWithOnRamperId;
    }

    function getAccountDeposits(address _account) external view returns (DepositWithAvailableLiquidity[] memory accountDeposits) {
        uint256[] memory accountDepositIds = accounts[_account].deposits;
        accountDeposits = new DepositWithAvailableLiquidity[](accountDepositIds.length);
        
        for (uint256 i = 0; i < accountDepositIds.length; ++i) {
            uint256 depositId = accountDepositIds[i];
            Deposit memory deposit = deposits[depositId];
            ( , uint256 reclaimableAmount) = _getPrunableIntents(depositId);

            accountDeposits[i] = DepositWithAvailableLiquidity({
                depositId: depositId,
                deposit: deposit,
                availableLiquidity: deposit.remainingDeposits + reclaimableAmount
            });
        }
    }

    function getDepositFromIds(uint256[] memory _depositIds) external view returns (DepositWithAvailableLiquidity[] memory depositArray) {
        depositArray = new DepositWithAvailableLiquidity[](_depositIds.length);

        for (uint256 i = 0; i < _depositIds.length; ++i) {
            uint256 depositId = _depositIds[i];
            Deposit memory deposit = deposits[depositId];
            ( , uint256 reclaimableAmount) = _getPrunableIntents(depositId);

            depositArray[i] = DepositWithAvailableLiquidity({
                depositId: depositId,
                deposit: deposit,
                availableLiquidity: deposit.remainingDeposits + reclaimableAmount
            });
        }

        return depositArray;
    }

    /* ============ Internal Functions ============ */

    /**
     * @notice Calculates the intentHash of new intent
     */
    function _calculateIntentHash(
        bytes32 _venmoId,
        uint256 _depositId
    )
        internal
        view
        virtual
        returns (bytes32 intentHash)
    {
        // Mod with circom prime field to make sure it fits in a 254-bit field
        uint256 intermediateHash = uint256(keccak256(abi.encodePacked(_venmoId, _depositId, block.timestamp)));
        intentHash = bytes32(intermediateHash % CIRCOM_PRIME_FIELD);
    }

    /**
     * @notice Cycles through all intents currently open on a deposit and sees if any have expired. If they have expired
     * the outstanding amounts are summed and returned alongside the intentHashes
     */
    function _getPrunableIntents(
        uint256 _depositId
    )
        internal
        view
        returns(bytes32[] memory prunableIntents, uint256 reclaimedAmount)
    {
        bytes32[] memory intentHashes = deposits[_depositId].intentHashes;
        prunableIntents = new bytes32[](intentHashes.length);

        for (uint256 i = 0; i < intentHashes.length; ++i) {
            Intent memory intent = intents[intentHashes[i]];
            if (intent.intentTimestamp + intentExpirationPeriod < block.timestamp) {
                prunableIntents[i] = intentHashes[i];
                reclaimedAmount += intent.amount;
            }
        }
    }

    function _pruneIntents(Deposit storage _deposit, bytes32[] memory _intents) internal {
        for (uint256 i = 0; i < _intents.length; ++i) {
            if (_intents[i] != bytes32(0)) {
                _pruneIntent(_deposit, _intents[i]);
            }
        }
    }

    /**
     * @notice Pruning an intent involves deleting its state from the intents mapping, zeroing out the intendee's venmoIdIntent
     * mapping, and deleting the intentHash from the deposit's intentHashes array.
     */
    function _pruneIntent(Deposit storage _deposit, bytes32 _intentHash) internal {
        Intent memory intent = intents[_intentHash];

        require(intent.intentTimestamp != 0, "Intent does not exist");

        delete venmoIdIntent[accounts[intent.onRamper].venmoIdHash];
        delete intents[_intentHash];
        _deposit.intentHashes.removeStorage(_intentHash);

        emit IntentPruned(_intentHash, intent.deposit);
    }

    /**
     * @notice Removes a deposit if no outstanding intents AND no remaining deposits. Deleting a deposit deletes it from the
     * deposits mapping and removes tracking it in the user's accounts mapping.
     */
    function _closeDepositIfNecessary(uint256 _depositId, Deposit storage _deposit) internal {
        uint256 openDepositAmount = _deposit.outstandingIntentAmount + _deposit.remainingDeposits;
        if (openDepositAmount == 0) {
            accounts[_deposit.depositor].deposits.removeStorage(_depositId);
            emit DepositClosed(_depositId, _deposit.depositor);
            delete deposits[_depositId];
        }
    }

    /**
     * @notice Validate venmo receive payment email and check that it hasn't already been used (done on ReciveProcessor).
     * Additionally, we validate that the onRamperIdHash matches the one from the specified intent and indicate if the 
     * convenience reward should be distributed.
     */
    function _verifyOnRampWithReceiveEmailProof(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[9] memory _signals
    )
        internal
        returns(Intent memory, bytes32)
    {
        (
            uint256 timestamp,
            bytes32 onRamperIdHash,
            bytes32 intentHash
        ) = receiveProcessor.processProof(
            IReceiveProcessor.ReceiveProof({
                a: _a,
                b: _b,
                c: _c,
                signals: _signals
            })
        );

        Intent memory intent = intents[intentHash];

        require(intent.intentTimestamp <= timestamp, "Intent was not created before send");
        require(accounts[intent.onRamper].venmoIdHash == onRamperIdHash, "Onramper id does not match or intent does not exist");

        return (intent, intentHash);
    }

    /**
     * @notice Validate venmo send payment email and check that it hasn't already been used (done on SendProcessor).
     * Additionally, we validate that the offRamperIdHash matches the one from the specified intent and that enough
     * was paid off-chain inclusive of the conversionRate.
     */
    function _verifyOnRampProof(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[10] memory _signals
    )
        internal
        returns(Intent memory, Deposit storage, bytes32)
    {
        (
            uint256 amount,
            uint256 timestamp,
            bytes32 offRamperIdHash,
            bytes32 intentHash
        ) = sendProcessor.processProof(
            ISendProcessor.SendProof({
                a: _a,
                b: _b,
                c: _c,
                signals: _signals
            })
        );

        Intent memory intent = intents[intentHash];
        Deposit storage deposit = deposits[intent.deposit];

        require(intent.intentTimestamp <= timestamp, "Intent was not created before send");
        require(accounts[deposit.depositor].venmoIdHash == offRamperIdHash, "Offramper id does not match");
        require(amount >= (intent.amount * PRECISE_UNIT) / deposit.conversionRate, "Payment was not enough");

        return (intent, deposit, intentHash);
    }

    /**
     * @notice Validate the user has a venmo account, we do not nullify this email since it can be reused to register under
     * different addresses.
     */
    function _verifyRegistrationProof(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[5] memory _signals
    )
        internal
        view
        returns(bytes32)
    {
        bytes32 venmoIdHash = registrationProcessor.processProof(
            IRegistrationProcessor.RegistrationProof({
                a: _a,
                b: _b,
                c: _c,
                signals: _signals
            })
        );

        return venmoIdHash;
    }
}
