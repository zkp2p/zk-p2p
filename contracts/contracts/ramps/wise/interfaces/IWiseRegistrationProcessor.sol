//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import { ITLSData } from "./ITLSData.sol";

interface IWiseRegistrationProcessor {

    struct RegistrationData {
        string accountId;
        string activeKey;
        string eligibleKey;
        string endpoint;
        string endpointType;
        string host;
    }

    struct RegistrationProof {
        RegistrationData public_values;
        bytes proof;
    }

    function processProof(
        RegistrationProof calldata _proof
    )
        external
    returns (bytes32);
}
