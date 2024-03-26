//SPDX-License-Identifier: MIT

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { Bytes32ArrayUtils } from "../../external/Bytes32ArrayUtils.sol";
import { Uint256ArrayUtils } from "../../external/Uint256ArrayUtils.sol";

import { IWiseAccountRegistry } from "./interfaces/IWiseAccountRegistry.sol";
import { IWiseSendProcessor } from "./interfaces/IWiseSendProcessor.sol";

pragma solidity ^0.8.18;

contract WiseRamp is Ownable {

    using Bytes32ArrayUtils for bytes32[];
    using Uint256ArrayUtils for uint256[];

    /* ============ Events ============ */
    event DepositReceived(
        uint256 indexed depositId,
        bytes32 indexed offRampId,
        bytes32 indexed currencyId,
        uint256 amount,
        uint256 conversionRate
    );
    event IntentSignaled(
        bytes32 indexed intentHash,
        uint256 indexed depositId,
        bytes32 indexed accountId,
        address to,
        uint256 amount,
        uint256 timestamp
    );

    event IntentPruned(
        bytes32 indexed intentHash,
        uint256 indexed depositId
    );
    event IntentFulfilled(
        bytes32 indexed intentHash,
        uint256 indexed depositId,
        address indexed onRamper,
        address to,
        uint256 amount,
        uint256 feeAmount
    );
    event DepositWithdrawn(
        uint256 indexed depositId,
        address indexed depositor,
        uint256 amount
    );

    event DepositClosed(uint256 depositId, address depositor);
    event MinDepositAmountSet(uint256 minDepositAmount);
    event MaxOnRampAmountSet(uint256 maxOnRampAmount);
    event IntentExpirationPeriodSet(uint256 intentExpirationPeriod);
    event OnRampCooldownPeriodSet(uint256 onRampCooldownPeriod);
    event SustainabilityFeeUpdated(uint256 fee);
    event SustainabilityFeeRecipientUpdated(address feeRecipient);
    event NewSendProcessorSet(address sendProcessor);

    /* ============ Structs ============ */

    struct Deposit {
        address depositor;
        string wiseTag;
        address verifierSigningKey;         // Public key of the verifier depositor wants to sign the TLS proof
        uint256 depositAmount;              // Amount of USDC deposited
        bytes32 receiveCurrencyId;          // Id of the currency to be received off-chain (bytes32(Wise currency code))
        uint256 remainingDeposits;          // Amount of remaining deposited liquidity
        uint256 outstandingIntentAmount;    // Amount of outstanding intents (may include expired intents)
        uint256 conversionRate;             // Conversion required by off-ramper between USDC/USD
        bytes32[] intentHashes;             // Array of hashes of all open intents (may include some expired if not pruned)
    }

    struct DepositWithAvailableLiquidity {
        uint256 depositId;                  // ID of the deposit
        bytes32 depositorId;                // Depositor's offRampId 
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
        bytes32 intentHash;                 // Intent hash
        Intent intent;                      // Intent struct
        bytes32 onRamperId;                 // onRamper's onRamperId
    }

    // A Global Account is defined as an account represented by one accountId. This is used to enforce limitations on actions across
    // all Ethereum addresses that are associated with that accountId. In this case we use it to enforce a cooldown period between on ramps,
    // restrict each Wise account to one outstanding intent at a time, and to enforce deny lists.
    struct GlobalAccountInfo {
        bytes32 currentIntentHash;          // Hash of the current open intent (if exists)
        uint256 lastOnrampTimestamp;        // Timestamp of the last on-ramp transaction used to check if cooldown period elapsed
        uint256[] deposits;                 // Array of open account deposits
    }

    /* ============ Modifiers ============ */
    modifier onlyRegisteredUser() {
        require(accountRegistry.isRegisteredUser(msg.sender), "Caller must be registered user");
        _;
    }

    /* ============ Constants ============ */
    uint256 internal constant PRECISE_UNIT = 1e18;
    uint256 internal constant MAX_DEPOSITS = 5;       // An account can only have max 5 different deposit parameterizations to prevent locking funds
    uint256 constant CIRCOM_PRIME_FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    uint256 constant MAX_SUSTAINABILITY_FEE = 5e16;   // 5% max sustainability fee
    
    /* ============ State Variables ============ */
    IERC20 public immutable usdc;                                   // USDC token contract
    IWiseAccountRegistry public accountRegistry;                    // Account Registry contract for Wise
    IWiseSendProcessor public sendProcessor;                        // Address of send processor contract

    bool public isInitialized;                                      // Indicates if contract has been initialized

    mapping(bytes32 => GlobalAccountInfo) internal globalAccount;   // Mapping of onRamp ID to information used to enforce actions across Ethereum accounts
    mapping(uint256 => Deposit) public deposits;                    // Mapping of depositIds to deposit structs
    mapping(bytes32 => Intent) public intents;                      // Mapping of intentHashes to intent structs

    uint256 public minDepositAmount;                                // Minimum amount of USDC that can be deposited
    uint256 public maxOnRampAmount;                                 // Maximum amount of USDC that can be on-ramped in a single transaction
    uint256 public onRampCooldownPeriod;                            // Time period that must elapse between completing an on-ramp and signaling a new intent
    uint256 public intentExpirationPeriod;                          // Time period after which an intent can be pruned from the system
    uint256 public sustainabilityFee;                               // Fee charged to on-rampers in preciseUnits (1e16 = 1%)
    address public sustainabilityFeeRecipient;                      // Address that receives the sustainability fee

    uint256 public depositCounter;                                  // Counter for depositIds

    /* ============ Constructor ============ */
    constructor(
        address _owner,
        IERC20 _usdc,
        uint256 _minDepositAmount,
        uint256 _maxOnRampAmount,
        uint256 _intentExpirationPeriod,
        uint256 _onRampCooldownPeriod,
        uint256 _sustainabilityFee,
        address _sustainabilityFeeRecipient
    )
        Ownable()
    {
        usdc = _usdc;
        minDepositAmount = _minDepositAmount;
        maxOnRampAmount = _maxOnRampAmount;
        intentExpirationPeriod = _intentExpirationPeriod;
        onRampCooldownPeriod = _onRampCooldownPeriod;
        sustainabilityFee = _sustainabilityFee;
        sustainabilityFeeRecipient = _sustainabilityFeeRecipient;

        transferOwnership(_owner);
    }

    /* ============ External Functions ============ */

    /**
     * @notice Initialize Ramp with the addresses of the Processors
     *
     * @param _accountRegistry     Account Registry contract for Wise
     * @param _sendProcessor       Send processor address
     */
    function initialize(
        IWiseAccountRegistry _accountRegistry,
        IWiseSendProcessor _sendProcessor
    )
        external
        onlyOwner
    {
        require(!isInitialized, "Already initialized");

        accountRegistry = _accountRegistry;
        sendProcessor = _sendProcessor;

        isInitialized = true;
    }

    /**
     * @notice Generates a deposit entry for off-rampers that can then be fulfilled by an on-ramper. This function will not add to
     * previous deposits. Every deposit has it's own unique identifier. User must approve the contract to transfer the deposit amount
     * of USDC.
     *
     * @param _wiseTag              Depositor's Wise tag to receive payments
     * @param _receiveCurrencyId    Id of the currency to be received off-chain
     * @param _depositAmount        The amount of USDC to off-ramp
     * @param _receiveAmount        The amount of USD to receive
     * @param _verifierSigningKey   Public key of the verifier depositor wants to sign the TLS proof
     */
    function offRamp(
        string calldata _wiseTag,
        bytes32 _receiveCurrencyId,
        uint256 _depositAmount,
        uint256 _receiveAmount,
        address _verifierSigningKey
    )
        external
        onlyRegisteredUser
    {
        IWiseAccountRegistry.AccountInfo memory account = accountRegistry.getAccountInfo(msg.sender);
        GlobalAccountInfo storage globalAccountInfo = globalAccount[account.accountId];

        require(account.offRampId != bytes32(0), "Must be registered as off ramper");
        require(keccak256(abi.encode(_wiseTag)) == account.wiseTagHash, "Wise tag does not match registered wise tag");
        require(globalAccountInfo.deposits.length < MAX_DEPOSITS, "Maximum deposit amount reached");
        require(_depositAmount >= minDepositAmount, "Deposit amount must be greater than min deposit amount");
        require(_receiveAmount > 0, "Receive amount must be greater than 0");

        uint256 conversionRate = (_depositAmount * PRECISE_UNIT) / _receiveAmount;
        uint256 depositId = depositCounter++;

        globalAccountInfo.deposits.push(depositId);

        deposits[depositId] = Deposit({
            depositor: msg.sender,
            wiseTag: _wiseTag,
            receiveCurrencyId: _receiveCurrencyId,
            depositAmount: _depositAmount,
            remainingDeposits: _depositAmount,
            outstandingIntentAmount: 0,
            conversionRate: conversionRate,
            intentHashes: new bytes32[](0),
            verifierSigningKey: _verifierSigningKey
        });

        usdc.transferFrom(msg.sender, address(this), _depositAmount);

        emit DepositReceived(depositId, account.accountId, _receiveCurrencyId, _depositAmount, conversionRate);
    }

    /**
     * @notice Signals intent to pay the depositor defined in the _depositId the _amount * deposit conversionRate off-chain
     * in order to unlock _amount of funds on-chain. Each user can only have one outstanding intent at a time regardless of
     * address (tracked using accountId). Caller must not be on the depositor's deny list. If there are prunable intents then
     * they will be deleted from the deposit to be able to maintain state hygiene.
     *
     * @param _depositId    The ID of the deposit the on-ramper intends to use for 
     * @param _amount       The amount of USDC the user wants to on-ramp
     * @param _to           Address to forward funds to (can be same as onRamper)
     */
    function signalIntent(uint256 _depositId, uint256 _amount, address _to) external onlyRegisteredUser {
        bytes32 onRamperId = accountRegistry.getAccountId(msg.sender);
        Deposit storage deposit = deposits[_depositId];

        // Caller validity checks
        require(accountRegistry.isAllowedUser(deposit.depositor, onRamperId), "Onramper on depositor's denylist");
        require(
            globalAccount[onRamperId].lastOnrampTimestamp + onRampCooldownPeriod <= block.timestamp,
            "On ramp cool down period not elapsed"
        );
        require(globalAccount[onRamperId].currentIntentHash == bytes32(0), "Intent still outstanding");
        require(accountRegistry.getAccountId(deposit.depositor) != onRamperId, "Sender cannot be the depositor");

        // Intent information checks
        require(deposit.depositor != address(0), "Deposit does not exist");
        require(_amount > 0, "Signaled amount must be greater than 0");
        require(_amount <= maxOnRampAmount, "Signaled amount must be less than max on-ramp amount");
        require(_to != address(0), "Cannot send to zero address");

        bytes32 intentHash = _calculateIntentHash(onRamperId, _depositId);

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

        globalAccount[onRamperId].currentIntentHash = intentHash;

        deposit.remainingDeposits -= _amount;
        deposit.outstandingIntentAmount += _amount;
        deposit.intentHashes.push(intentHash);

        emit IntentSignaled(intentHash, _depositId, onRamperId, _to, _amount, block.timestamp);
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
        require(
            accountRegistry.getAccountId(intent.onRamper) == accountRegistry.getAccountId(msg.sender),
            "Sender must be the on-ramper"
        );

        Deposit storage deposit = deposits[intent.deposit];

        _pruneIntent(deposit, _intentHash);

        deposit.remainingDeposits += intent.amount;
        deposit.outstandingIntentAmount -= intent.amount;
    }

    /**
     * @notice Anyone can submit an on-ramp transaction, even if caller isn't on-ramper. Upon submission the proof is validated,
     * intent is removed, and deposit state is updated. USDC is transferred to the on-ramper.
     *
     * @param _sendData         Struct containing unredacted data from API call to Wise
     * @param _verifierSignature  Signature by verifier of the unredacted data
     */
    function onRamp(
        IWiseSendProcessor.SendData calldata _sendData,
        bytes calldata _verifierSignature
    )
        external
    {
        (
            Intent memory intent,
            Deposit storage deposit,
            bytes32 intentHash
        ) = _verifyOnRampProof(_sendData, _verifierSignature);

        _pruneIntent(deposit, intentHash);

        deposit.outstandingIntentAmount -= intent.amount;
        globalAccount[accountRegistry.getAccountId(intent.onRamper)].lastOnrampTimestamp = block.timestamp;
        _closeDepositIfNecessary(intent.deposit, deposit);

        _transferFunds(intentHash, intent);
    }

    /**
     * @notice Allows off-ramper to release funds to the on-ramper in case of a failed on-ramp or because of some other arrangement
     * between the two parties. Upon submission we check to make sure the msg.sender is the depositor, the  intent is removed, and 
     * deposit state is updated. USDC is transferred to the on-ramper.
     *
     * @param _intentHash        Hash of intent to resolve by releasing the funds
     */
    function releaseFundsToOnramper(bytes32 _intentHash) external {
        Intent memory intent = intents[_intentHash];
        Deposit storage deposit = deposits[intent.deposit];

        require(intent.onRamper != address(0), "Intent does not exist");
        require(deposit.depositor == msg.sender, "Caller must be the depositor");

        _pruneIntent(deposit, _intentHash);

        deposit.outstandingIntentAmount -= intent.amount;
        globalAccount[accountRegistry.getAccountId(intent.onRamper)].lastOnrampTimestamp = block.timestamp;
        _closeDepositIfNecessary(intent.deposit, deposit);

        _transferFunds(_intentHash, intent);
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

    /* ============ Governance Functions ============ */

    /**
     * @notice GOVERNANCE ONLY: Updates the send processor address used for validating and interpreting zk proofs.
     *
     * @param _sendProcessor   New send proccesor address
     */
    function setSendProcessor(IWiseSendProcessor _sendProcessor) external onlyOwner {
        sendProcessor = _sendProcessor;
        emit NewSendProcessorSet(address(_sendProcessor));
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
     * @notice GOVERNANCE ONLY: Updates the sustainability fee. This fee is charged to on-rampers upon a successful on-ramp.
     *
     * @param _fee   The new sustainability fee in precise units (10**18, ie 10% = 1e17)
     */
    function setSustainabilityFee(uint256 _fee) external onlyOwner {
        require(_fee <= MAX_SUSTAINABILITY_FEE, "Fee cannot be greater than max fee");

        sustainabilityFee = _fee;
        emit SustainabilityFeeUpdated(_fee);
    }

    /**
     * @notice GOVERNANCE ONLY: Updates the recepient of sustainability fees.
     *
     * @param _feeRecipient   The new fee recipient address
     */
    function setSustainabilityFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Fee recipient cannot be zero address");

        sustainabilityFeeRecipient = _feeRecipient;
        emit SustainabilityFeeRecipientUpdated(_feeRecipient);
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
     * @notice GOVERNANCE ONLY: Updates the on-ramp cooldown period, once an on-ramp transaction is completed the user must wait this
     * amount of time before they can signalIntent to on-ramp again.
     *
     * @param _onRampCooldownPeriod   New on-ramp cooldown period
     */
    function setOnRampCooldownPeriod(uint256 _onRampCooldownPeriod) external onlyOwner {
        onRampCooldownPeriod = _onRampCooldownPeriod;
        emit OnRampCooldownPeriodSet(_onRampCooldownPeriod);
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

    function getIdCurrentIntentHash(address _account) public view returns (bytes32) {
        return globalAccount[accountRegistry.getAccountId(_account)].currentIntentHash;
    }

    function getIdCurrentIntentHashAsUint(address _account) external view returns (uint256) {
        return uint256(getIdCurrentIntentHash(_account));
    }

    function getLastOnRampTimestamp(address _account) external view returns (uint256) {
        return globalAccount[accountRegistry.getAccountId(_account)].lastOnrampTimestamp;
    }

    function getIntentsWithOnRamperId(bytes32[] calldata _intentHashes) external view returns (IntentWithOnRamperId[] memory) {
        IntentWithOnRamperId[] memory intentsWithOnRamperId = new IntentWithOnRamperId[](_intentHashes.length);

        for (uint256 i = 0; i < _intentHashes.length; ++i) {
            bytes32 intentHash = _intentHashes[i];
            Intent memory intent = intents[intentHash];
            intentsWithOnRamperId[i] = IntentWithOnRamperId({
                intentHash: _intentHashes[i],
                intent: intent,
                onRamperId: accountRegistry.getAccountId(intent.onRamper)
            });
        }

        return intentsWithOnRamperId;
    }

    function getAccountDeposits(address _account) external view returns (DepositWithAvailableLiquidity[] memory accountDeposits) {
        uint256[] memory accountDepositIds = globalAccount[accountRegistry.getAccountId(_account)].deposits;
        accountDeposits = new DepositWithAvailableLiquidity[](accountDepositIds.length);
        
        for (uint256 i = 0; i < accountDepositIds.length; ++i) {
            uint256 depositId = accountDepositIds[i];
            Deposit memory deposit = deposits[depositId];
            ( , uint256 reclaimableAmount) = _getPrunableIntents(depositId);

            accountDeposits[i] = DepositWithAvailableLiquidity({
                depositId: depositId,
                depositorId: accountRegistry.getAccountId(deposit.depositor),
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
                depositorId: accountRegistry.getAccountId(deposit.depositor),
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
        bytes32 _accountId,
        uint256 _depositId
    )
        internal
        view
        virtual
        returns (bytes32 intentHash)
    {
        // Mod with circom prime field to make sure it fits in a 254-bit field
        uint256 intermediateHash = uint256(keccak256(abi.encodePacked(_accountId, _depositId, block.timestamp)));
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
     * @notice Pruning an intent involves deleting its state from the intents mapping, zeroing out the intendee's currentIntentHash in
     * their global account mapping, and deleting the intentHash from the deposit's intentHashes array.
     */
    function _pruneIntent(Deposit storage _deposit, bytes32 _intentHash) internal {
        Intent memory intent = intents[_intentHash];

        delete globalAccount[accountRegistry.getAccountId(intent.onRamper)].currentIntentHash;
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
            globalAccount[accountRegistry.getAccountId(_deposit.depositor)].deposits.removeStorage(_depositId);
            emit DepositClosed(_depositId, _deposit.depositor);
            delete deposits[_depositId];
        }
    }

    /**
     * @notice Checks if sustainability fee has been defined, if so sends fee to the fee recipient and intent amount minus fee
     * to the on-ramper. If sustainability fee is undefined then full intent amount is transferred to on-ramper.
     */
    function _transferFunds(bytes32 _intentHash, Intent memory _intent) internal {
        uint256 fee;
        if (sustainabilityFee != 0) {
            fee = (_intent.amount * sustainabilityFee) / PRECISE_UNIT;
            usdc.transfer(sustainabilityFeeRecipient, fee);
        }

        uint256 onRampAmount = _intent.amount - fee;
        usdc.transfer(_intent.to, onRampAmount);

        emit IntentFulfilled(_intentHash, _intent.deposit, _intent.onRamper, _intent.to, onRampAmount, fee);
    }

    /**
     * @notice Validate send payment email and check that it hasn't already been used (done on SendProcessor).
     * Additionally, we validate that the offRamperId matches the one from the specified intent and that enough
     * was paid off-chain inclusive of the conversionRate.
     */
    function _verifyOnRampProof(
        IWiseSendProcessor.SendData calldata _data,
        bytes calldata _verifierSignature
    )
        internal
        returns(Intent storage intent, Deposit storage deposit, bytes32 intentHash)
    {
        intentHash = bytes32(_data.intentHash);
        intent = intents[intentHash];
        require(intent.onRamper == msg.sender, "Caller must be the on-ramper");

        deposit = deposits[intent.deposit];

        (
            uint256 amount,
            uint256 timestamp,
            bytes32 offRamperId,
            bytes32 onRamperId,
            bytes32 currencyId
        ) = sendProcessor.processProof(
            IWiseSendProcessor.SendProof({
                public_values: _data,
                proof: _verifierSignature
            }),
            deposit.verifierSigningKey
        );

        require(currencyId == deposit.receiveCurrencyId, "Wrong currency sent");
        require(intent.intentTimestamp <= timestamp, "Intent was not created before send");
        require(accountRegistry.getAccountInfo(deposit.depositor).offRampId == offRamperId, "Offramper id does not match");
        require(accountRegistry.getAccountId(intent.onRamper) == onRamperId, "Onramper id does not match");
        require(amount >= (intent.amount * PRECISE_UNIT) / deposit.conversionRate, "Payment was not enough");
    }
}
