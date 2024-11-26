//SPDX-License-Identifier: MIT

import { IProxyBaseProcessor } from "../../../processors/interfaces/IProxyBaseProcessor.sol";

pragma solidity ^0.8.18;

interface ISendProcessorV3 is IProxyBaseProcessor {

    function processProof(
        Proof calldata _proof
    )
        external
    returns(uint256, uint256, bytes32, bytes32, bytes32);
}
