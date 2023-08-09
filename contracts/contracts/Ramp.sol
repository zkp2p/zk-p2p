//SPDX-License-Identifier: MIT

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { Bytes32ArrayUtils } from "./lib/Bytes32ArrayUtils.sol";

import { IReceiveProcessor } from "./interfaces/IReceiveProcessor.sol";
import { ISendProcessor } from "./interfaces/ISendProcessor.sol";

pragma solidity ^0.8.18;

contract Ramp is Ownable {

    using Bytes32ArrayUtils for bytes32[];

    /* ============ Events ============ */
    event AccountRegistered(bytes32 indexed accountId, address indexed account);
    event DepositReceived(
        bytes32 indexed depositHash,
        bytes32 indexed venmoId,
        uint256 amount,
        uint256 conversionRate,
        uint256 convenienceFee
    );
    event IntentSignaled(
        bytes32 indexed intentHash,
        bytes32 indexed depositHash,
        bytes32 indexed venmoId,
        uint256 amount,
        uint256 timestamp
    );

    event IntentPruned(
        bytes32 indexed intentHash,
        bytes32 indexed depositHash
    );

    event IntentFulfilled(
        bytes32 indexed intentHash,
        bytes32 indexed depositHash,
        bytes32 indexed venmoId,
        uint256 amount,
        uint256 convenienceFee
    );

    event DepositWithdrawn(
        bytes32 indexed depositHash,
        bytes32 indexed venmoId,
        uint256 amount
    );

    event AccountOwnerUpdated(
        bytes32 indexed venmoId,
        address newOwner
    );

    /* ============ Structs ============ */

    struct Deposit {
        bytes32 depositor;
        uint256 remainingDeposits;          // Amount of remaining deposited liquidity
        uint256 outstandingIntentAmount;    // Amount of outstanding intents (may include expired intents)
        uint256 conversionRate;             // Conversion required by off-ramper between USDC/USD
        uint256 convenienceFee;             // Amount of USDC per on-ramp transaction available to be claimed by off-ramper
        bytes32[] intentHashes;             // Array of hashes of all open intents (may include some expired if not pruned)
    }

    struct Intent {
        bytes32 onramper;
        bytes32 deposit;
        uint256 amount;
        uint256 intentTimestamp;
    }

    /* ============ Constants ============ */
    uint256 public constant PRECISE_UNIT = 1e18;
    
    /* ============ State Variables ============ */
    IERC20 public immutable usdc;
    IReceiveProcessor public immutable receiveProcessor;
    ISendProcessor public immutable sendProcessor;

    mapping(bytes32 => address) public accountIds;
    mapping(bytes32 => Deposit) public deposits;
    mapping(bytes32 => Intent) public intents;

    /* ============ Constructor ============ */
    constructor(
        address _owner,
        IERC20 _usdc,
        IReceiveProcessor _receiveProcessor,
        ISendProcessor _sendProcessor
    )
        Ownable()
    {
        usdc = _usdc;
        receiveProcessor = _receiveProcessor;
        sendProcessor = _sendProcessor;
        transferOwnership(_owner);
    }

    /* ============ External Functions ============ */

    /**
     * @notice Registers a new account by pulling the hash of the account id from the proof and assigning the account owner to the
     * sender of the transaction.
     *
     * @param _pubInputs    The public inputs of the proof
     * @param _proof        The proof
     */
    function register(uint256[] memory _pubInputs, bytes memory _proof) external {
        bytes32 accountId = bytes32(_pubInputs[0]); // VALIDATE THIS IS THE CORRECT PUBLIC INPUT
        require(accountIds[accountId] == address(0), "Account already registered");

        accountIds[accountId] = msg.sender;
        emit AccountRegistered(accountId, msg.sender);
    }

    /**
     * @notice Generates a deposit entry for off-rampers that can then be fulfilled by an on-ramper. If a deposit by the same user
     * with the same conversion rate and convenience fee already exists then the deposit amount is added to the existing deposit. User
     * must approve the contract to transfer the deposit amount of USDC.
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
        require(accountIds[_venmoId] == msg.sender, "Sender must be the account owner");
        require(_depositAmount > 0, "Deposit amount must be greater than 0");
        require(_receiveAmount > 0, "Receive amount must be greater than 0");

        uint256 conversionRate = (_depositAmount * PRECISE_UNIT) / _receiveAmount;
        bytes32 depositIdHash = keccak256(abi.encodePacked(_venmoId, conversionRate, _convenienceFee));

        usdc.transferFrom(msg.sender, address(this), _depositAmount);

        Deposit storage deposit = deposits[depositIdHash];

        if (deposit.outstandingIntentAmount !=0 || deposit.remainingDeposits != 0) {
            deposit.remainingDeposits += _depositAmount;
        } else {
            deposit.depositor = _venmoId;
            deposit.remainingDeposits = _depositAmount;
            deposit.outstandingIntentAmount = 0;
            deposit.conversionRate = conversionRate;
            deposit.convenienceFee = _convenienceFee;
        }

        emit DepositReceived(depositIdHash, _venmoId, _depositAmount, conversionRate, _convenienceFee);
    }

    function signalIntent(bytes32 _venmoId, bytes32 _depositHash, uint256 _amount) external {
        require(accountIds[_venmoId] == msg.sender, "Sender must be the account owner");
        require(_amount > 0, "Signaled amount must be greater than 0");

        bytes32 intentHash = _calculateIntentHash(_venmoId, _depositHash);

        Deposit storage deposit = deposits[_depositHash];
        if (deposit.remainingDeposits < _amount) {
            (
                bytes32[] memory prunableIntents,
                uint256 reclaimableAmount
            ) = _getPrunableIntents(_depositHash);

            require(deposit.remainingDeposits + reclaimableAmount >= _amount, "Not enough liquidity");

            _pruneIntents(deposit, prunableIntents);
            deposit.remainingDeposits += reclaimableAmount;
            deposit.outstandingIntentAmount -= reclaimableAmount;
        }

        intents[intentHash] = Intent({
            onramper: _venmoId,
            deposit: _depositHash,
            amount: _amount,
            intentTimestamp: block.timestamp
        });

        deposit.remainingDeposits -= _amount;
        deposit.outstandingIntentAmount += _amount;
        deposit.intentHashes.push(intentHash);

        emit IntentSignaled(intentHash, _depositHash, _venmoId, _amount, block.timestamp);
    }

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
            bytes32 intentHash
        ) = _verifyOnRampWithConvenienceProof(_a, _b, _c, _signals);

        Deposit storage deposit = deposits[intent.deposit];

        bytes32 depositor = deposits[intent.deposit].depositor;

        require(accountIds[depositor] == msg.sender, "Sender must be the account owner");

        _pruneIntent(deposit, intentHash);

        deposit.outstandingIntentAmount -= intent.amount;

        usdc.transfer(accountIds[intent.onramper], intent.amount - deposit.convenienceFee);
        usdc.transfer(msg.sender, deposit.convenienceFee);

        emit IntentFulfilled(intentHash, intent.deposit, intent.onramper, intent.amount, deposit.convenienceFee);
    }

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

        usdc.transfer(accountIds[intent.onramper], intent.amount);
        
        emit IntentFulfilled(intentHash, intent.deposit, intent.onramper, intent.amount, 0);
    }

    function withdrawDeposit(bytes32[] memory _depositHashes) external {
        uint256 returnAmount;

        for (uint256 i = 0; i < _depositHashes.length; ++i) {
            bytes32 depositHash = _depositHashes[i];
            Deposit storage deposit = deposits[depositHash];

            require(accountIds[deposit.depositor] == msg.sender, "Sender must be the account owner");

            (
                bytes32[] memory prunableIntents,
                uint256 reclaimableAmount
            ) = _getPrunableIntents(depositHash);

            _pruneIntents(deposit, prunableIntents);

            returnAmount += deposit.remainingDeposits + reclaimableAmount;
            
            deposit.outstandingIntentAmount -= reclaimableAmount;

            emit DepositWithdrawn(depositHash, deposit.depositor, deposit.remainingDeposits + reclaimableAmount);
            
            delete deposit.remainingDeposits;
            if (deposit.outstandingIntentAmount == 0) {
                delete deposits[depositHash];
            }
        }

        usdc.transfer(msg.sender, returnAmount);
    }

    function setAccountOwner(bytes32 _venmoId, address _newOwner) external {
        require(accountIds[_venmoId] == msg.sender, "Sender must be the account owner");
        require(_newOwner != address(0), "New owner cannot be zero address");

        accountIds[_venmoId] = _newOwner;

        emit AccountOwnerUpdated(_venmoId, _newOwner);
    }

    /* ============ Governance Functions ============ */

    // Set new SendProcessor
    // Set new ReceiveProcessor
    // Set ConvenienceRewardTimePeriod

    /* ============ External View Functions ============ */

    function getDeposit(bytes32 _depositHash) external view returns (Deposit memory) {
        return deposits[_depositHash];
    }

    /* ============ Internal Functions ============ */

    function _calculateIntentHash(
        bytes32 _venmoId,
        bytes32 _depositHash
    )
        internal
        view
        virtual
        returns (bytes32 intentHash)
    {
        intentHash = keccak256(abi.encodePacked(_venmoId, _depositHash, block.timestamp));
        require(intents[intentHash].amount == 0, "Intent already exists");
    }

    function _getPrunableIntents(
        bytes32 _depositHash
    )
        internal
        view
        returns(bytes32[] memory prunableIntents, uint256 reclaimedAmount)
    {
        bytes32[] memory intentHashes = deposits[_depositHash].intentHashes;
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
        bytes32 depositHash = intents[_intent].deposit;

        delete intents[_intent];
        _deposit.intentHashes.removeStorage(_intent);

        emit IntentPruned(_intent, depositHash);
    }

    function _verifyOnRampWithConvenienceProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[51] memory signals
    )
        internal
        view
        returns(Intent memory, bytes32)
    {
        (
            uint256 timestamp,
            uint256 onRamperId,
            bytes32 onRamperIdHash,
            bytes32 intentHash
        ) = receiveProcessor.processProof(a, b, c, signals);

        Intent memory intent = intents[intentHash];
        require(intent.onramper == onRamperIdHash, "Onramper id does not match");

        return (intent, intentHash);
    }

    function _verifyOnRampProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[51] memory signals
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
        ) = receiveProcessor.processProof(a, b, c, signals);

        Intent memory intent = intents[intentHash];
        Deposit storage deposit = deposits[intent.deposit];

        require(deposit.depositor == offRamperIdHash, "Offramper id does not match");
        require(amount >= intent.amount, "Payment was not enough");

        return (intent, deposit, intentHash);
    }
}
