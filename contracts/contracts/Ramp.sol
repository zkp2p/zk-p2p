//SPDX-License-Identifier: MIT

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { Bytes32ArrayUtils } from "./lib/Bytes32ArrayUtils.sol";

import { IReceiveProcessor } from "./interfaces/IReceiveProcessor.sol";
import { IRegistrationProcessor } from "./interfaces/IRegistrationProcessor.sol";
import { ISendProcessor } from "./interfaces/ISendProcessor.sol";

pragma solidity ^0.8.18;

contract Ramp is Ownable {

    using Bytes32ArrayUtils for bytes32[];

    /* ============ Events ============ */
    event AccountRegistered(address indexed accountOwner, bytes32 indexed venmoIdHash);
    event DepositReceived(
        uint256 indexed depositId,
        bytes32 indexed venmoId,
        uint256 amount,
        uint256 conversionRate,
        uint256 convenienceFee
    );
    event IntentSignaled(
        bytes32 indexed intentHash,
        uint256 indexed depositId,
        bytes32 indexed venmoId,
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
        uint256 amount,
        uint256 convenienceFee
    );
    // Do we want to emit the depositor or the venmoId
    event DepositWithdrawn(
        uint256 indexed depositId,
        address indexed depositor,
        uint256 amount
    );

    /* ============ Structs ============ */

    struct AccountInfo {
        bytes32 venmoIdHash;
        uint256[] deposits;
    }

    struct Deposit {
        address depositor;
        uint256 remainingDeposits;          // Amount of remaining deposited liquidity
        uint256 outstandingIntentAmount;    // Amount of outstanding intents (may include expired intents)
        uint256 conversionRate;             // Conversion required by off-ramper between USDC/USD
        uint256 convenienceFee;             // Amount of USDC per on-ramp transaction available to be claimed by off-ramper
        bytes32[] intentHashes;             // Array of hashes of all open intents (may include some expired if not pruned)
    }

    struct Intent {
        address onramper;
        uint256 deposit;
        uint256 amount;
        uint256 intentTimestamp;
    }

    /* ============ Constants ============ */
    uint256 public constant PRECISE_UNIT = 1e18;
    uint256 public constant MAX_DEPOSITS = 5;       // An account can only have max 5 different deposit parameterizations to prevent locking funds
    
    /* ============ State Variables ============ */
    IERC20 public immutable usdc;
    IReceiveProcessor public receiveProcessor;
    IRegistrationProcessor public registrationProcessor;
    ISendProcessor public sendProcessor;

    mapping(address => AccountInfo) public accounts;
    mapping(bytes32 => bytes32) public venmoIdIntent;   // Mapping of venmoIdHash to intentHash, we limit one intent per venmoId
    mapping(uint256 => Deposit) public deposits;
    mapping(bytes32 => Intent) public intents;

    uint256 public convenienceRewardTimePeriod;
    uint256 public minDepositAmount;
    uint256 public depositCounter;

    /* ============ Constructor ============ */
    constructor(
        address _owner,
        IERC20 _usdc,
        IReceiveProcessor _receiveProcessor,
        IRegistrationProcessor _registrationProcessor,
        ISendProcessor _sendProcessor,
        uint256 _minDepositAmount,
        uint256 _convenienceRewardTimePeriod
    )
        Ownable()
    {
        usdc = _usdc;
        receiveProcessor = _receiveProcessor;
        registrationProcessor = _registrationProcessor;
        sendProcessor = _sendProcessor;
        minDepositAmount = _minDepositAmount;
        convenienceRewardTimePeriod = _convenienceRewardTimePeriod;
        transferOwnership(_owner);
    }

    /* ============ External Functions ============ */

    /**
     * @notice Registers a new account by pulling the hash of the account id from the proof and assigning the account owner to the
     * sender of the transaction.
     */
    function register(
        uint[2] memory _a,
        uint[2][2] memory _b,
        uint[2] memory _c,
        uint[45] memory _signals
    )
        external
    {
        require(accounts[msg.sender].venmoIdHash == bytes32(0), "Account already associated with venmoId");
        (
            uint256 venmoId,
            bytes32 venmoIdHash
        ) = _verifyRegistrationProof(_a, _b, _c, _signals);

        accounts[msg.sender].venmoIdHash = venmoIdHash;

        emit AccountRegistered(msg.sender, venmoIdHash);
    }

    /**
     * @notice Generates a deposit entry for off-rampers that can then be fulfilled by an on-ramper. This function will not add to
     * previous deposits. Every deposit has it's own unique identifier. Usermust approve the contract to transfer the deposit amount
     * of USDC.
     *
     * @param _venmoId          The venmo id of the account owner
     * @param _depositAmount    The amount of USDC to off-ramp
     * @param _receiveAmount    The amount of USD to receive
     * @param _convenienceFee   The amount of USDC per on-ramp transaction available to be claimed by off-ramper
     */
    function offRamp(
        bytes32 _venmoId,
        uint256 _depositAmount,
        uint256 _receiveAmount,
        uint256 _convenienceFee
    ) external {
        require(accounts[msg.sender].venmoIdHash == _venmoId, "Sender must be the account owner");
        require(_depositAmount >= minDepositAmount, "Deposit amount must be greater than min deposit amount");
        require(_receiveAmount > 0, "Receive amount must be greater than 0");

        uint256 conversionRate = (_depositAmount * PRECISE_UNIT) / _receiveAmount;
        uint256 depositId = depositCounter++;

        usdc.transferFrom(msg.sender, address(this), _depositAmount);
        accounts[msg.sender].deposits.push(depositId);

        deposits[depositId] = Deposit({
            depositor: msg.sender,
            remainingDeposits: _depositAmount,
            outstandingIntentAmount: 0,
            conversionRate: conversionRate,
            convenienceFee: _convenienceFee,
            intentHashes: new bytes32[](0)
        });

        emit DepositReceived(depositId, _venmoId, _depositAmount, conversionRate, _convenienceFee);
    }

    // Do we need to pass in venmoId here??
    function signalIntent(bytes32 _venmoId, uint256 _depositId, uint256 _amount) external {
        require(accounts[msg.sender].venmoIdHash == _venmoId, "Sender must be the account owner");
        require(_amount > 0, "Signaled amount must be greater than 0");
        require(venmoIdIntent[_venmoId] == bytes32(0), "Intent still outstanding");

        bytes32 intentHash = _calculateIntentHash(_venmoId, _depositId);

        Deposit storage deposit = deposits[_depositId];
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
            onramper: msg.sender,
            deposit: _depositId,
            amount: _amount,
            intentTimestamp: block.timestamp
        });

        venmoIdIntent[_venmoId] = intentHash;

        deposit.remainingDeposits -= _amount;
        deposit.outstandingIntentAmount += _amount;
        deposit.intentHashes.push(intentHash);

        emit IntentSignaled(intentHash, _depositId, _venmoId, _amount, block.timestamp);
    }

    // function replaceIntent(bytes32 _venmoId, bytes32 _depositId, uint256 _amount) external {
    //     require(accounts[msg.sender].venmoIdHash == _venmoId, "Sender must be the account owner");
    //     require(_amount > 0, "Signaled amount must be greater than 0");
    //     require(venmoIdIntent[_venmoId] != bytes32(0), "Intent must be outstanding to call");

    //     bytes32 pendingIntentHash = accounts[msg.sender].pendingIntentHash;
    //     Intent storage currentIntent = intents[pendingIntentHash];
    //     _pruneIntent(deposits[currentIntent.deposit], pendingIntentHash);
    // }

    // DO we need to prune deposits now? In order to not pass blank deposits
    function onRampWithConvenience(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[51] memory _signals
    )
        external
    {
        (
            Intent memory intent,
            bytes32 intentHash,
            bool distributeConvenienceReward
        ) = _verifyOnRampWithConvenienceProof(_a, _b, _c, _signals);

        Deposit storage deposit = deposits[intent.deposit];

        require(deposit.depositor == msg.sender, "Sender must be the account owner");

        _pruneIntent(deposit, intentHash);

        deposit.outstandingIntentAmount -= intent.amount;

        uint256 convenienceFee = distributeConvenienceReward ? deposit.convenienceFee : 0;
        usdc.transfer(intent.onramper, intent.amount - convenienceFee);
        usdc.transfer(msg.sender, convenienceFee);

        emit IntentFulfilled(intentHash, intent.deposit, intent.onramper, intent.amount, convenienceFee);
    }

    // DO we need to prune deposits now? In order to not pass blank deposits
    function onRamp(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[51] memory _signals
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

        usdc.transfer(intent.onramper, intent.amount);
        
        emit IntentFulfilled(intentHash, intent.deposit, intent.onramper, intent.amount, 0);
    }

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
            if (deposit.outstandingIntentAmount == 0) {
                delete deposits[depositId];
            }
        }

        usdc.transfer(msg.sender, returnAmount);
    }

    /* ============ Governance Functions ============ */

    // Set new SendProcessor
    // Set new ReceiveProcessor
    // Set new RegistrationProcessor

    function setConvenienceRewardTimePeriod(uint256 _convenienceRewardTimePeriod) external onlyOwner {
        require(_convenienceRewardTimePeriod != 0, "Convenience reward time period cannot be zero");
        convenienceRewardTimePeriod = _convenienceRewardTimePeriod;
    }

    function setMinDepositAmount(uint256 _minDepositAmount) external onlyOwner {
        require(_minDepositAmount != 0, "Minimum deposit cannot be zero");
        minDepositAmount = _minDepositAmount;
    }

    /* ============ External View Functions ============ */

    function getDeposit(uint256 _depositId) external view returns (Deposit memory) {
        return deposits[_depositId];
    }

    function getAccountDeposits(address _account) external view returns (Deposit[] memory accountDeposits) {
        uint256[] memory accountDepositIds = accounts[_account].deposits;
        accountDeposits = new Deposit[](accountDepositIds.length);
        
        for (uint256 i = 0; i < accountDepositIds.length; ++i) {
            accountDeposits[i] = deposits[accountDepositIds[i]];
        }
    }

    function getAccountVenmoId(address _account) external view returns (bytes32) {
        return accounts[_account].venmoIdHash;
    }

    function getDepositFromIds(uint256[] memory _depositIds) external view returns (Deposit[] memory depositArray) {
        depositArray = new Deposit[](_depositIds.length);

        for (uint256 i = 0; i < _depositIds.length; ++i) {
            depositArray[i] = deposits[_depositIds[i]];
        }

        return depositArray;
    }

    /* ============ Internal Functions ============ */

    function _calculateIntentHash(
        bytes32 _venmoId,
        uint256 _depositId
    )
        internal
        view
        virtual
        returns (bytes32 intentHash)
    {
        intentHash = keccak256(abi.encodePacked(_venmoId, _depositId, block.timestamp));
        require(intents[intentHash].amount == 0, "Intent already exists");
    }

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
            if (intent.intentTimestamp + 1 days < block.timestamp) {
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

    function _pruneIntent(Deposit storage _deposit, bytes32 _intent) internal {
        uint256 depositId = intents[_intent].deposit;

        delete venmoIdIntent[accounts[intents[_intent].onramper].venmoIdHash];
        delete intents[_intent];
        _deposit.intentHashes.removeStorage(_intent);

        emit IntentPruned(_intent, depositId);
    }

    function _verifyOnRampWithConvenienceProof(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[51] memory _signals
    )
        internal
        view
        returns(Intent memory, bytes32, bool)
    {
        (
            uint256 timestamp,
            uint256 onRamperId,
            bytes32 onRamperIdHash,
            bytes32 intentHash
        ) = receiveProcessor.processProof(_a, _b, _c, _signals);

        Intent memory intent = intents[intentHash];
        require(accounts[intent.onramper].venmoIdHash == onRamperIdHash, "Onramper id does not match");

        bool distributeConvenienceReward = block.timestamp - timestamp < convenienceRewardTimePeriod;
        return (intent, intentHash, distributeConvenienceReward);
    }

    function _verifyOnRampProof(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[51] memory _signals
    )
        internal
        view
        returns(Intent memory, Deposit storage, bytes32)
    {
        (
            uint256 amount,
            uint256 offRamperId,
            bytes32 offRamperIdHash,
            bytes32 intentHash
        ) = receiveProcessor.processProof(_a, _b, _c, _signals);

        Intent memory intent = intents[intentHash];
        Deposit storage deposit = deposits[intent.deposit];

        require(accounts[deposit.depositor].venmoIdHash == offRamperIdHash, "Offramper id does not match");
        require(amount >= intent.amount, "Payment was not enough");

        return (intent, deposit, intentHash);
    }

    function _verifyRegistrationProof(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[45] memory _signals
    )
        internal
        view
        returns(uint256, bytes32)
    {
        (
            uint256 venmoId,
            bytes32 venmoIdHash
        ) = registrationProcessor.processProof(_a, _b, _c, _signals);

        return (venmoId, venmoIdHash);
    }
}
