pragma solidity ^0.8.18;

interface IReceiveProcessor {
    function processProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[32] memory signals
    )
        external
        view
    returns(uint256, uint256, bytes32, bytes32);
}
