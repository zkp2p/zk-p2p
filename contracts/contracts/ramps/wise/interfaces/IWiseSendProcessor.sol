//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import { ITLSData } from "./ITLSData.sol";

interface IWiseSendProcessor {

    struct SendData {
        string transferId;
        string senderId;
        string recipientId;
        string timestamp;
        string currencyId;
        string amount;
        string intentHash;
        string activeKey;
        string eligibleKey;
        string endpoint;
        string endpointType;
        string host;
    }

    struct SendProof {
        SendData public_values;
        ITLSData.TLSParams expectedTLSParams;
        bytes proof;
    }

    function processProof(
        SendProof calldata _proof
    )
        external
    returns(uint256, uint256, bytes32, bytes32, bytes32);
}
