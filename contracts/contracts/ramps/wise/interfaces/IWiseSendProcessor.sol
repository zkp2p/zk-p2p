//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

interface IWiseSendProcessor {

    struct SendData {
        string endpoint;
        string host;
        string transferId;
        string senderId;
        string recipientId;
        string timestamp;
        string currencyId;
        string amount;
        string status;
        bytes32 intentHash;
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
