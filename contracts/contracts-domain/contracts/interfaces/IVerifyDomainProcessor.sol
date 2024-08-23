//SPDX-License-Identifier: MIT
import { IProxyBaseProcessor } from "../external/interfaces/IProxyBaseProcessor.sol";

pragma solidity ^0.8.18;

interface IVerifyDomainProcessor is IProxyBaseProcessor {
    
    struct DomainRaw {
        string name;
        uint256 expiryTime;
    }

    function verifyProofs(
        Proof[] memory _proofs
    ) 
        external  
        returns (DomainRaw[] memory domains);
}