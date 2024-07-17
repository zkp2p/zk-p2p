//SPDX-License-Identifier: MIT
import { Claims } from "@reclaimprotocol/verifier-solidity-sdk/contracts/Claims.sol";

pragma solidity ^0.8.18;

interface IClaimVerifier {

    struct Proof {
        Claims.ClaimInfo claimInfo;
        Claims.SignedClaim signedClaim;
    }

    // add other functions
}
