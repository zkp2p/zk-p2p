pragma solidity ^0.8.18;

interface ISendProcessor {
    function processProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[51] memory signals
    )
        external
        view
    returns(uint256, uint256, bytes32, bytes32);
}
