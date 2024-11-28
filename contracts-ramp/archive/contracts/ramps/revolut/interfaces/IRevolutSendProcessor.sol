//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

interface IRevolutSendProcessor {

    struct SendData {
        string endpoint;
        string host;
        string transferId;
        string recipientId;
        string amount;
        string currencyId;
        string status;
        string timestamp;
        uint256 intentHash;
        uint256 notaryKeyHash;
    }

    struct SendProof {
        SendData public_values;
        bytes proof;
    }

    function processProof(
        SendProof calldata _proof,
        address _verifierSigningKey
    )
        external
    returns(uint256, uint256, bytes32, bytes32, bytes32);
}
