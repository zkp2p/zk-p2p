//SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IRampV2 {
    
    struct DepositBalances {
        uint256 amount;
        uint256 remainingDeposits;
        uint256 outstandingIntentAmount;
    }

    struct Deposit {
        uint256 depositId;
        address depositor;
        IERC20 token;
        DepositBalances balances;
        address[] gatingServices;
        bool acceptWhitelistedgatingServices;
        address[] processors;
        address[] witness;
        bytes data;
        uint256 conversionRate;
        bytes32[] intentHashes;
    }

    struct Intent {
        address onRamper;
        address gatingService;
        address processor;
        address to;
        uint256 deposit;
        uint256 amount;
        uint256 timestamp;
    }

    function createDeposit(
        IERC20 _token,
        uint256 _amount,
        uint256 _conversionRate,
        address[] calldata _gatingServices,
        bool _acceptWhitelistedgatingServices,
        address[] calldata _processors,
        address[] calldata _witness,
        bytes calldata _data
    ) external;

    function signalIntent(
        uint256 _depositId,
        uint256 _amount,
        address _to,
        address _processor,
        address _gatingService,
        bytes calldata _gatingServiceSignature
    ) external;

    function onRamp(bytes calldata _proof, address _processor) external;

    // function releaseFundsToOnramper(bytes32 _intentHash) external;
    
    // function cancelIntent(bytes32 _intentHash) external;

    // function withdrawDeposit(uint256[] calldata _depositIds) external;
}
