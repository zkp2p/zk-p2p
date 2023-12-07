//SPDX-License-Identifier: MIT

import { StringUtils } from "@zk-email/contracts/utils/StringUtils.sol";

import { BaseProcessorV2 } from "./BaseProcessorV2.sol";
import { Groth16Verifier } from "../verifiers/hdfc_registration_verifier.sol";
import { IKeyHashAdapterV2 } from "./keyHashAdapters/IKeyHashAdapterV2.sol";
import { INullifierRegistry } from "./nullifierRegistries/INullifierRegistry.sol";
import { IRegistrationProcessor } from "../interfaces/IRegistrationProcessor.sol";

pragma solidity ^0.8.18;

contract HDFCRegistrationProcessor is Groth16Verifier, IRegistrationProcessor, BaseProcessorV2 {

    using StringUtils for uint256[];

    /* ============ Constants ============ */
    uint256 constant public PACK_SIZE = 7;
    
    /* ============ Constructor ============ */
    constructor(
        address _ramp,
        IKeyHashAdapterV2 _hdfcMailserverKeyHashAdapter,
        INullifierRegistry _nullifierRegistry,
        string memory _emailFromAddress
    )
        Groth16Verifier()
        BaseProcessorV2(_ramp, _hdfcMailserverKeyHashAdapter, _nullifierRegistry, _emailFromAddress)
    {}

    /* ============ External Functions ============ */

    function processProof(
        IRegistrationProcessor.RegistrationProof calldata _proof
    )
        public
        view
        override
        onlyRamp
        returns(bytes32 userIdHash)
    {
        require(this.verifyProof(_proof.a, _proof.b, _proof.c, _proof.signals), "Invalid Proof"); // checks effects iteractions, this should come first

        require(isMailServerKeyHash(bytes32(_proof.signals[0])), "Invalid mailserver key hash");

        // Signals [1:4] are the packed from email address
        string memory fromEmail = _parseSignalArray(_proof.signals, 1, 4);
        require(keccak256(abi.encodePacked(fromEmail)) == keccak256(emailFromAddress), "Invalid email from address");

        // Signals [4] is the packed onRamperIdHash
        userIdHash = bytes32(_proof.signals[4]);
    }

    /* ============ Internal Functions ============ */

    function _parseSignalArray(uint256[5] calldata _signals, uint8 _from, uint8 _to) internal pure returns (string memory) {
        uint256[] memory signalArray = new uint256[](_to - _from);
        for (uint256 i = _from; i < _to; i++) {
            signalArray[i - _from] = _signals[i];
        }

        return signalArray.convertPackedBytesToString(signalArray.length * PACK_SIZE, PACK_SIZE);
    }
}
