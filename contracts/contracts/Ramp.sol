//SPDX-License-Identifier: MIT

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { Bytes32ArrayUtils } from "./lib/Bytes32ArrayUtils.sol";

pragma solidity ^0.8.18;

contract Ramp is Ownable {

    using Bytes32ArrayUtils for bytes32[];

    /* ============ Events ============ */
    event AccountRegistered(bytes32 indexed accountId, address indexed account);
    event IntentSignaled(
        bytes32 indexed intentHash,
        bytes32 indexed depositHash,
        bytes32 indexed venmoId,
        uint256 amount,
        uint256 timestamp
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
        bytes32 accountId = bytes32(pubInputs[0]);
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
    }

    function signalIntent(bytes32 _venmoId, bytes32 _depositHash, uint256 _amount) external {
        require(accountIds[_venmoId] == msg.sender, "Sender must be the account owner");
        require(_amount > 0, "Signaled amount must be greater than 0");

        bytes32 intentHash = keccak256(abi.encodePacked(_venmoId, _depositHash, block.timestamp));
        require(intents[intentHash].amount == 0, "Intent already exists");

        uint256 remainingDeposits = deposits[_depositHash].remainingDeposits;
        if (remainingDeposits < _amount) {
            (
                bytes32[] memory prunableIntents,
                uint256 reclaimableAmount
            ) = _getPrunableIntents(_depositHash);

            require(remainingDeposits + reclaimableAmount >= _amount, "Not enough liquidity");

            _pruneIntents(_depositHash, prunableIntents);
            deposits[_depositHash].remainingDeposits += reclaimableAmount;
            deposits[_depositHash].outstandingIntentAmount -= reclaimableAmount;
        }

        intents[intentHash] = Intent({
            onramper: _venmoId,
            deposit: _depositHash,
            amount: _amount,
            intentTimestamp: block.timestamp
        });

        deposits[_depositHash].remainingDeposits -= _amount;
        deposits[_depositHash].outstandingIntentAmount += _amount;

        emit IntentSignaled(intentHash, _depositHash, _venmoId, _amount, block.timestamp);
    }
    /* ============ External View Functions ============ */
    /* ============ Internal Functions ============ */

    function _getPrunableIntents(
        bytes32 _depositHash
    )
        internal
        view
        returns(bytes32[] memory prunableIntents, uint256 reclaimedAmount)
    {
        bytes32[] memory intentHashes = deposits[_depositHash].intentHashes;

        for (uint256 i = 0; i < intentHashes.length; ++i) {
            Intent memory intent = intents[intentHashes[i]];
            if (intent.intentTimestamp + 1 days < block.timestamp) {
                prunableIntents[i] = intentHashes[i];
                reclaimedAmount += intent.amount;
            }
        }
    }

    function _pruneIntents(bytes32 _depositHash, bytes32[] memory _intents) internal {
        bytes32[] storage intentHashes = deposits[_depositHash].intentHashes;
        for (uint256 i = 0; i < _intents.length; ++i) {
            delete intents[_intents[i]];
            intentHashes.removeStorage(_intents[i]);
        }
    }
}
