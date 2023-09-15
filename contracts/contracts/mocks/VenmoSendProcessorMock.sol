import { ISendProcessor } from "../interfaces/ISendProcessor.sol";

pragma solidity ^0.8.18;

contract VenmoSendProcessorMock is ISendProcessor {

    /* ============ Constructor ============ */
    constructor() {}

    /* ============ External View Functions ============ */
    function processProof(
        SendProof calldata _proof
    )
        public
        pure
        override
        returns(uint256 amount, bytes32 offRamperIdHash, bytes32 intentHash)
    {
        return(_proof.signals[0], bytes32(_proof.signals[2]), bytes32(_proof.signals[3]));
    }
}
