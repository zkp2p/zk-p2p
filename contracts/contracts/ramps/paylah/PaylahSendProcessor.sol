//SPDX-License-Identifier: MIT

import { StringUtils } from "@zk-email/contracts/utils/StringUtils.sol";

import { BaseProcessorV2 } from "../../processors/BaseProcessorV2.sol";
import { Groth16Verifier } from "../../verifiers/paylah_send_verifier.sol";
import { IKeyHashAdapterV2 } from "../../processors/keyHashAdapters/IKeyHashAdapterV2.sol";
import { INullifierRegistry } from "../../processors/nullifierRegistries/INullifierRegistry.sol";
import { IPaylahSendProcessor } from "./interfaces/IPaylahSendProcessor.sol";
import { StringConversionUtils } from "../../lib/StringConversionUtils.sol";

pragma solidity ^0.8.18;

contract PaylahSendProcessor is Groth16Verifier, IPaylahSendProcessor, BaseProcessorV2 {
    
    using StringUtils for uint256[];
    using StringConversionUtils for string;

    /* ============ Constants ============ */
    uint256 constant PACK_SIZE = 7;

    /* ============ Constructor ============ */
    constructor(
        address _ramp,
        IKeyHashAdapterV2 _paylahMailserverKeyHashAdapter,
        INullifierRegistry _nullifierRegistry,
        string memory _emailFromAddress,
        uint256 _timestampBuffer
    )
        Groth16Verifier()
        BaseProcessorV2(
            _ramp,
            _paylahMailserverKeyHashAdapter,
            _nullifierRegistry,
            _emailFromAddress,
            _timestampBuffer
        )
    {}
    
    /* ============ External Functions ============ */
    function processProof(
        IPaylahSendProcessor.SendProof calldata _proof
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
    {
        require(this.verifyProof(_proof.a, _proof.b, _proof.c, _proof.signals), "Invalid Proof"); // checks effects iteractions, this should come first

        require(isMailServerKeyHash(bytes32(_proof.signals[0])), "Invalid mailserver key hash");

        // Signals [1:4] are the packed from email address
        string memory fromEmail = _parseSignalArray(_proof.signals, 1, 4);
        require(keccak256(abi.encodePacked(fromEmail)) == keccak256(emailFromAddress), "Invalid email from address");

        // Signals [6:7] is the packed amount, since this is a USDC amount we want to make sure the returned number is
        // properly padded to 6 decimals. If the parsed has more than 6 figures to the right of the decimal it will revert
        amount = _parseSignalArray(_proof.signals, 6, 7).stringToUint(6);

        // Signals [4:6] are the packed timestamp, the timestamp is returned as a string in the format, that we need to
        // parse and convert to a unix timestamp
        timestamp = _parseSignalArray(_proof.signals, 4, 6).stringToUint(0) + timestampBuffer;

        // Signals [7] is the packed onRamperIdHash
        onRamperIdHash = bytes32(_proof.signals[7]);

        // Signals [8] is the packed offRamper UPI ID hash
        offRamperIdHash = bytes32(_proof.signals[8]);

        // Check if email has been used previously, if not nullify it so it can't be used again
        _validateAndAddNullifier(bytes32(_proof.signals[9]));

        // Signals [10] is intentHash
        intentHash = bytes32(_proof.signals[10]);
    }
    
    /* ============ Internal Functions ============ */

    function _parseSignalArray(uint256[11] calldata _signals, uint8 _from, uint8 _to) internal pure returns (string memory) {
        uint256[] memory signalArray = new uint256[](_to - _from);
        for (uint256 i = _from; i < _to; i++) {
            signalArray[i - _from] = _signals[i];
        }

        return signalArray.convertPackedBytesToString(signalArray.length * PACK_SIZE, PACK_SIZE);
    }
}
