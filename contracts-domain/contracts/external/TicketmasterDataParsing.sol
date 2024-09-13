//SPDX-License-Identifier: MIT

import { DateTime } from "./lib/DateTime.sol";

import { StringConversionUtils } from "./lib/StringConversionUtils.sol";
import { ClaimVerifier } from "./ClaimVerifier.sol";

pragma solidity ^0.8.18;

library TicketmasterDataParsing {
    
    using StringConversionUtils for string;

    /**
     * @notice Iterates through every character in the date string and splits the string at each dash, "T", or colon. Function will revert
     * if there are not 6 substrings formed from the split. The substrings are then converted to uints and passed to the DateTime lib
     * to get the unix timestamp. This function is SPECIFIC TO THE DATE FORMAT USED BY Ticketmaster, not suitable for use with other date
     * formats. Ticketmaster date format is: "YYYY-MM-DDTHH:MM:SS" and returns UTC timestamps.
     *
     * @param _dateString       Date string to be converted to a UTC timestamp
     */
    function _dateStringToTimestamp(string memory _dateString) internal pure returns (uint256 utcTimestamp) {
        string[6] memory extractedStrings;
        uint256 breakCounter;
        uint256 lastBreak;
        for (uint256 i = 0; i < bytes(_dateString).length; i++) {
            if (bytes(_dateString)[i] == 0x2d || bytes(_dateString)[i] == 0x3a || bytes(_dateString)[i] == 0x54) {
                extractedStrings[breakCounter] = _dateString.substring(lastBreak, i);
                lastBreak = i + 1;
                breakCounter++;
            }
        }
        // Add last substring to array
        extractedStrings[breakCounter] = _dateString.substring(lastBreak, bytes(_dateString).length);

        // Check that exactly 6 substrings were found (string is split at 5 different places)
        require(breakCounter == 5, "Invalid date string");

        utcTimestamp = DateTime.timestampFromDateTime(
            extractedStrings[0].stringToUint(0),    // year
            extractedStrings[1].stringToUint(0),    // month
            extractedStrings[2].stringToUint(0),    // day
            extractedStrings[3].stringToUint(0),    // hour
            extractedStrings[4].stringToUint(0),    // minute
            0                                       // we don't need to the second granularity
        );
    }

    /**
     * Extract event ID from URL by finding the last slash and taking the substring after it. We assume the
     * URL is formulated something like: {domainRoot}/.../event/EVENT_ID
     *
     * @param _url          URL to extract event ID from
     * @return              Event ID extracted from URL
     */
    function _extractEventIdFromUrl(string memory _url) internal pure returns (string memory) {
        string memory prefix = "event/";
        bytes memory urlBytes = bytes(_url);
        uint256 urlLength = urlBytes.length;

        uint256 startIndex = ClaimVerifier.findSubstringEndIndex(_url, prefix);
        // If the start index is the max value or the URL length, then the event ID was not found
        if (startIndex == type(uint256).max || startIndex == urlLength) {
            revert("Event ID not found in URL");
        }

        bytes memory contextMessage = new bytes(urlLength - startIndex);
        for (uint i = startIndex; i < urlLength; i++) {
            contextMessage[i - startIndex] = urlBytes[i];
        }
        return string(contextMessage);
    }

    /**
     * Parse tickets out of a ticket string of the format: '["ticket1", "ticket2", "ticket3"]'.
     * We start by getting the number of tickets in a string by counting the number of commas and adding 1.
     * Then we iterate through the string and find the ticket IDs by looking for the quotes. We need to extract
     * from quote to quote so we look for all even-numbered quotes then extract the string between that and the
     * previous quote index.
     *
     * @param _ticketString          Stringified array of tickets
     */
     function _parseTicketString(string memory _ticketString) internal pure returns (string[] memory ticketIds) {
        // Assume there is at least one ticket (which means array would not have a comma)
        // If there is no ticket then the transaction will end up reverting
        uint256 ticketCount = 1;
        for (uint256 i = 0; i < bytes(_ticketString).length; i++) {
            if (bytes(_ticketString)[i] == 0x2C) {
                ticketCount++;
            }
        }

        ticketIds = new string[](ticketCount);
        uint256 breakCounter;
        uint256 lastBreak;
        for (uint256 i = 0; i < bytes(_ticketString).length; i++) {
            if (bytes(_ticketString)[i] == 0x22) {
                breakCounter++;
                if (breakCounter % 2 == 0) {
                    ticketIds[(breakCounter/2)-1] = _ticketString.substring(lastBreak, i-1);
                }
                lastBreak = i + 1;
            }
        }
    }
}
