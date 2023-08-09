import { IReceiveProcessor } from "../interfaces/IReceiveProcessor.sol";

pragma solidity ^0.8.18;

contract VenmoReceiveProcessorMock is IReceiveProcessor {

    /* ============ Constructor ============ */
    constructor() {}

    /* ============ External View Functions ============ */
    function processProof(
        uint[2] memory /*a*/,
        uint[2][2] memory /*b*/,
        uint[2] memory /*c*/,
        uint[51] memory signals
    )
        public
        pure
        override
        returns(uint256 timestamp, uint256 onRamperId, bytes32 onRamperIdHash, bytes32 intentHash)
    {
        return(signals[0], signals[1], bytes32(signals[2]), bytes32(signals[3]));
    }
}
