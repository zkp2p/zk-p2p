//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

interface IWiseOffRamperRegistrationProcessor {

    struct OffRamperRegistrationData {
        string endpoint;
        string host;
        string profileId;
        string mcAccountId;
    }

    struct OffRamperRegistrationProof {
        OffRamperRegistrationData public_values;
        bytes proof;
    }

    function processProof(
        OffRamperRegistrationProof calldata _proof
    )
        external
    returns (bytes32, bytes32);
}
