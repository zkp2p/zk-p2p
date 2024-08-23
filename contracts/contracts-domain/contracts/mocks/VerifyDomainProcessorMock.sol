// SPDX-License-Identifier: MIT

import { ClaimVerifier } from "../external/ClaimVerifier.sol";
import { StringConversionUtils } from "../external/lib/StringConversionUtils.sol";
import { TicketmasterDataParsing } from "../external/TicketmasterDataParsing.sol";

import { IVerifyDomainProcessor } from "../interfaces/IVerifyDomainProcessor.sol";

pragma solidity ^0.8.18;

contract VerifyDomainProcessorMock is IVerifyDomainProcessor {

    using StringConversionUtils for string;

    uint8 constant MAX_EXTRACT_VALUES = 5;

    function verifyProofs(Proof[] memory _proofs)
        external
        pure
        returns (DomainRaw[] memory domains)
    {
        domains = new DomainRaw[](_proofs.length);

        for (uint256 i = 0; i < _proofs.length; i++) {
            domains[i] = DomainRaw({
                name: string(_proofs[i].signedClaim.signatures[0]),
                // The TicketmasterDataParsing library's date parsing logic is pretty generic, and works for domain 
                // expiry dates as well. Similar to Ticketmaster dates, the expiry time is of the format "YYYY-MM-DDTHH:MM:SS"
                // and returns UTC timestamps.
                expiryTime: TicketmasterDataParsing._dateStringToTimestamp(string(_proofs[i].signedClaim.signatures[1]))
            });
        }

        return domains;
    }
}
