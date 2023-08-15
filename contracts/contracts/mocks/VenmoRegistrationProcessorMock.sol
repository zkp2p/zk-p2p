import { IRegistrationProcessor } from "../interfaces/IRegistrationProcessor.sol";

pragma solidity ^0.8.18;

contract VenmoRegistrationProcessorMock is IRegistrationProcessor {

    /* ============ Constructor ============ */
    constructor() {}

    /* ============ External View Functions ============ */
    function processProof(
        uint[2] memory /*a*/,
        uint[2][2] memory /*b*/,
        uint[2] memory /*c*/,
        uint[45] memory signals
    )
        public
        pure
        override
        returns(uint256 onRamperId, bytes32 onRamperIdHash)
    {
        return(signals[0], bytes32(signals[1]));
    }
}
