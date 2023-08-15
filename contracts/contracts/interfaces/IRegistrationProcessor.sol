pragma solidity ^0.8.18;

interface IRegistrationProcessor {
    function processProof(
        uint[2] memory _a,
        uint[2][2] memory _b,
        uint[2] memory _c,
        uint[45] memory _signals
    )
        external
        view
    returns(uint256, bytes32);
}
