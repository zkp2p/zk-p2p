//SPDX-License-Identifier: MIT

import { StringUtils } from "@zk-email/contracts/utils/StringUtils.sol";

import { BaseProcessor } from "./BaseProcessor.sol";
import { Groth16Verifier } from "../verifiers/venmo_send_verifier.sol";
import { IKeyHashAdapter } from "./keyHashAdapters/IKeyHashAdapter.sol";
import { INullifierRegistry } from "./nullifierRegistries/INullifierRegistry.sol";
import { ISendProcessor } from "../interfaces/ISendProcessor.sol";

pragma solidity ^0.8.18;

contract VenmoSendProcessor is Groth16Verifier, ISendProcessor, BaseProcessor {
    
    using StringUtils for string;
    using StringUtils for uint256[];

    /* ============ Constructor ============ */
    constructor(
        address _ramp,
        IKeyHashAdapter _venmoMailserverKeyHashAdapter,
        INullifierRegistry _nullifierRegistry,
        string memory _emailFromAddress
    )
        Groth16Verifier()
        BaseProcessor(_ramp, _venmoMailserverKeyHashAdapter, _nullifierRegistry, _emailFromAddress)
    {}
    
    /* ============ External Functions ============ */
    function processProof(
        ISendProcessor.SendProof calldata _proof
    )
        public
        override
        onlyRamp
        returns(uint256 amount, uint256 timestamp, bytes32 offRamperIdHash, bytes32 intentHash)
    {
        require(this.verifyProof(_proof.a, _proof.b, _proof.c, _proof.signals), "Invalid Proof"); // checks effects iteractions, this should come first

        require(bytes32(_proof.signals[0]) == getMailserverKeyHash(), "Invalid mailserver key hash");

        // Signals [1:4] are the packed from email address
        string memory fromEmail = _parseSignalArray(_proof.signals, 1, 4);
        require(keccak256(abi.encodePacked(fromEmail)) == keccak256(emailFromAddress), "Invalid email from address");

        // Signals [4:5] is the packed amount, multiply by 1e4 since venmo only gives us two decimals instead of 6
        amount = _parseSignalArray(_proof.signals, 4, 6).stringToUint() * 1e4;

        // Signals [5:7] are the packed timestamp
        timestamp = _parseSignalArray(_proof.signals, 6, 8).stringToUint();

        // Signals [8] is the packed offRamperIdHsdh
        offRamperIdHash = bytes32(_proof.signals[8]);

        // Check if email has been used previously, if not nullify it so it can't be used again
        _validateAndAddNullifier(bytes32(_proof.signals[9]));

        // Signals [9] is intentHash
        intentHash = bytes32(_proof.signals[10]);
    }

    /* ============ Internal Functions ============ */

    function _parseSignalArray(uint256[11] calldata _signals, uint8 _from, uint8 _to) internal pure returns (string memory) {
        uint256[] memory signalArray = new uint256[](_to - _from);
        for (uint256 i = _from; i < _to; i++) {
            signalArray[i - _from] = _signals[i];
        }

        return signalArray.convertPackedBytesToString();
    }
}
