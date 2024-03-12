//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import { ITLSData } from "./ITLSData.sol";

interface IWiseRegistrationProcessor {

    struct RegistrationData {
        string endpoint;
        string host;
        string profileId;
        string wiseTagHash;
    }

    struct RegistrationProof {
        RegistrationData public_values;
        bytes proof;
    }

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

    function processAccountProof(
        RegistrationProof calldata _proof
    )
        external
    returns (bytes32, bytes32);

    function processOffRamperProof(
        OffRamperRegistrationProof calldata _proof
    )
        external
    returns (bytes32, bytes32);
}
