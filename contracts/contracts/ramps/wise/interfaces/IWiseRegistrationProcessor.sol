//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import { ITLSData } from "./ITLSData.sol";

interface IWiseRegistrationProcessor {

    struct RegistrationData {
        string endpoint;
        string host;
        string profileId;
        string mcAccountId;
    }

    struct RegistrationProof {
        RegistrationData public_values;
        bytes proof;
    }

    function processProof(
        RegistrationProof calldata _proof
    )
        external
    returns (bytes32, bytes32);

    // function processOffRampProof(
    //     RegistrationProof calldata _proof
    // )
    //     external
    // returns (bytes32);
}
