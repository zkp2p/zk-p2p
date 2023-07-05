//SPDX-License-Identifier: MIT

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { Bytes32ArrayUtils } from "./lib/Bytes32ArrayUtils.sol";

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

    mapping(bytes32=>address) public accountIds;
    mapping(bytes32 => Deposit) public deposits;
    mapping(bytes32 => Intent) public intents;

    /* ============ Constructor ============ */
    constructor(address _owner, IERC20 _usdc) Ownable() {
        usdc = _usdc;
        transferOwnership(_owner);
    }

    /* ============ External Functions ============ */
    function register(uint256[] memory pubInputs, bytes memory proof) external {
        bytes32 accountId = bytes32(pubInputs[0]); // VALIDATE THIS IS THE CORRECT PUBLIC INPUT
        require(accountIds[accountId] == address(0), "Account already registered");

        accountIds[accountId] = msg.sender;
        emit AccountRegistered(accountId, msg.sender);
    }

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

        bytes32 intentHash = keccak256(abi.encodePacked(_venmoId, _depositHash, block.timestamp));
        require(intents[intentHash].amount == 0, "Intent already exists");

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

    function onRampWithConvenience(bytes32 _intent, uint256[] memory pubInputs, bytes memory proof) external {
        Intent memory intent = intents[_intent];
        Deposit storage deposit = deposits[intent.deposit];

        bytes32 depositor = deposits[intent.deposit].depositor;

        require(accountIds[depositor] == msg.sender, "Sender must be the account owner");
        // Validate proof

        _pruneIntent(deposit, _intent);

        deposit.outstandingIntentAmount -= intent.amount;

        usdc.transfer(accountIds[intent.onramper], intent.amount - deposit.convenienceFee);
        usdc.transfer(msg.sender, deposit.convenienceFee);
    }

    function onRamp(bytes32 _intent, uint256[] memory pubInputs, bytes memory proof) external {
        Intent memory intent = intents[_intent];
        Deposit storage deposit = deposits[intent.deposit];

        // Validate proof

        bytes32[] memory prunableIntents = new bytes32[](1);
        prunableIntents[0] = _intent;
        _pruneIntents(deposit, prunableIntents);

        deposit.outstandingIntentAmount -= intent.amount;

        usdc.transfer(accountIds[intent.onramper], intent.amount);
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
            delete deposit.remainingDeposits;

            if (deposit.outstandingIntentAmount == 0) {
                delete deposits[depositHash];
            }
        }

        usdc.transfer(msg.sender, returnAmount);
    }

    function setAccountOwner(bytes32 _venmoId, address _newOwner) external onlyOwner {
        require(accountIds[_venmoId] == msg.sender, "Sender must be the account owner");
        require(_newOwner != address(0), "New owner cannot be zero address");

        accountIds[_venmoId] = _newOwner;
    }

    /* ============ External View Functions ============ */

    function getDeposit(bytes32 _depositHash) external view returns (Deposit memory) {
        return deposits[_depositHash];
    }

    /* ============ Internal Functions ============ */

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
            // TO DO: check that intentHash isn't zero bytes since we expect there to be some blanks passed along for still valid intent hashes
            _pruneIntent(_deposit, _intents[i]);
        }
    }

    function _pruneIntent(Deposit storage _deposit, bytes32 _intent) internal {
        bytes32 depositHash = intents[_intent].deposit;

        delete intents[_intent];
        _deposit.intentHashes.removeStorage(_intent);

        emit IntentPruned(_intent, depositHash);
    }
}
