//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

interface IWiseAccountRegistrationProcessor {

    struct RegistrationData {
        string endpoint;
        string host;
        string profileId;
        string accessDate;
        string wiseTagHash;
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
}
