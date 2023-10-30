//SPDX-License-Identifier: MIT

import { BaseProcessor } from "./BaseProcessor.sol";
import { Groth16Verifier } from "../verifiers/hdfc_send_verifier.sol";
import { IKeyHashAdapter } from "./keyHashAdapters/IKeyHashAdapter.sol";
import { INullifierRegistry } from "./nullifierRegistries/INullifierRegistry.sol";
import { IHdfcSendProcessor } from "../interfaces/IHdfcSendProcessor.sol";
import { ProofParsingUtils } from "../lib/ProofParsingUtils.sol";

pragma solidity ^0.8.18;

contract HdfcSendProcessor is Groth16Verifier, IHdfcSendProcessor, BaseProcessor {
    
    using ProofParsingUtils for string;
    using ProofParsingUtils for uint256[];

    /* ============ Constructor ============ */
    constructor(
        address _ramp,
        IKeyHashAdapter _hdfcMailserverKeyHashAdapter,
        INullifierRegistry _nullifierRegistry,
        string memory _emailFromAddress
    )
        Groth16Verifier()
        BaseProcessor(_ramp, _hdfcMailserverKeyHashAdapter, _nullifierRegistry, _emailFromAddress)
    {}
    
    /* ============ External Functions ============ */
    function processProof(
        IHdfcSendProcessor.SendProof calldata _proof
    )
        public
        override
        onlyRamp
        returns(uint256 amount, string memory date, bytes32 offRamperIdHash, bytes32 intentHash)
    {
        require(this.verifyProof(_proof.a, _proof.b, _proof.c, _proof.signals), "Invalid Proof"); // checks effects iteractions, this should come first

        require(bytes32(_proof.signals[0]) == getMailserverKeyHash(), "Invalid mailserver key hash");

        // Signals [1:4] are the packed from email address
        string memory fromEmail = _parseSignalArray(_proof.signals, 1, 4);
        require(keccak256(abi.encodePacked(fromEmail)) == keccak256(emailFromAddress), "Invalid email from address");

        // Signals [4:6] is the packed amount, multiply by 1e4 since venmo only gives us two decimals instead of 6
        amount = _parseSignalArray(_proof.signals, 4, 6).stringToUint256() * 1e4;

        // Signals [6:11] are the packed date
        date = _parseSignalArray(_proof.signals, 6, 11);

        // Signals [11] is the packed offRamperIdHsdh
        offRamperIdHash = bytes32(_proof.signals[11]);

        // Check if email has been used previously, if not nullify it so it can't be used again
        _validateAndAddNullifier(bytes32(_proof.signals[12]));

        // Signals [13] is intentHash
        intentHash = bytes32(_proof.signals[13]);
    }

    /* ============ Internal Functions ============ */

    function _parseSignalArray(uint256[14] calldata _signals, uint8 _from, uint8 _to) internal pure returns (string memory) {
        uint256[] memory signalArray = new uint256[](_to - _from);
        for (uint256 i = _from; i < _to; i++) {
            signalArray[i - _from] = _signals[i];
        }

        return signalArray.convertPackedBytesToBytes(_to - _from);
    }
}
