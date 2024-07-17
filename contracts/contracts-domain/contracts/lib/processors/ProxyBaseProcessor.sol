//SPDX-License-Identifier: MIT

import { ClaimVerifier } from "./ClaimVerifier.sol";
import { INullifierRegistry } from "../../interfaces/INullifierRegistry.sol";

pragma solidity ^0.8.18;

contract ProxyBaseProcessor is ClaimVerifier {

    INullifierRegistry public immutable nullifierRegistry;

    constructor(INullifierRegistry _nulliferRegistry) ClaimVerifier() {
        nullifierRegistry = _nulliferRegistry;
    }

    /* ============ Internal Functions ============ */

    function _validateAndAddNullifier(bytes32 _nullifier) internal {
        require(!nullifierRegistry.isNullified(_nullifier), "Nullifier has already been used");
        nullifierRegistry.addNullifier(_nullifier);
    }
}
