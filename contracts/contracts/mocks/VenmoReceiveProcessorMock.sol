import { IReceiveProcessor } from "../interfaces/IReceiveProcessor.sol";

pragma solidity ^0.8.18;

contract VenmoReceiveProcessorMock is IReceiveProcessor {

    /* ============ Constructor ============ */
    constructor() {}

    /* ============ External View Functions ============ */
    function processProof(
        ReceiveProof calldata _proof
    )
        public
        pure
        override
        returns(uint256 timestamp, bytes32 onRamperIdHash, bytes32 intentHash)
    {
        return(_proof.signals[0], bytes32(_proof.signals[2]), bytes32(_proof.signals[3]));
    }
}
