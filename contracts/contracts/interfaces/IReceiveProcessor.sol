pragma solidity ^0.8.18;

interface IReceiveProcessor {

    struct ReceiveProof {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
        uint256[14] signals;
    }

    function processProof(
        ReceiveProof calldata _proof
    )
        external
    returns(uint256, bytes32, bytes32);
}
