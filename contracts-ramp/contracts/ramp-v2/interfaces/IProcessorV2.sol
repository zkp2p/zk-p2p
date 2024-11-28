//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import { IRampV2 } from "./IRampV2.sol";

interface IProcessorV2 {

    function maxOnRampAmount() external view returns (uint256);
    function intentExpirationPeriod() external view returns (uint256);
    function onRampCooldownPeriod() external view returns (uint256);

    function extractIntentHash(
        bytes calldata _proof
    )
        external returns(bytes32 intentHash);

    function verifyPayment(
        bytes calldata _proof,
        IRampV2.Intent calldata _intent,
        IRampV2.Deposit calldata _deposit
    )   
        external returns(bool success);

}
