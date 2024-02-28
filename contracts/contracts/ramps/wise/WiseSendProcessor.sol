//SPDX-License-Identifier: MIT

import { TLSBaseProcessor } from "../../processors/TLSBaseProcessor.sol";
import { IKeyHashAdapterV2 } from "../../processors/keyHashAdapters/IKeyHashAdapterV2.sol";
import { INullifierRegistry } from "../../processors/nullifierRegistries/INullifierRegistry.sol";
import { IWiseSendProcessor } from "./interfaces/IWiseSendProcessor.sol";

pragma solidity ^0.8.18;

contract WiseSendProcessor is IWiseSendProcessor, TLSBaseProcessor {

    /* ============ Constructor ============ */
    constructor(
        address _ramp,
        INullifierRegistry _nullifierRegistry,
        uint256 _timestampBuffer
    )
        TLSBaseProcessor(
            _ramp,
            _nullifierRegistry,
            _timestampBuffer
        )
    {}
    
    /* ============ External Functions ============ */
    function processProof(
        IWiseSendProcessor.SendProof calldata _proof
    )
        public
        override
        onlyRamp
        returns(
            uint256 amount,
            uint256 timestamp,
            bytes32 offRamperIdHash,
            bytes32 onRamperIdHash,
            bytes32 intentHash
        )
    {}
}
