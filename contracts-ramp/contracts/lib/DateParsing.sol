//SPDX-License-Identifier: MIT

import { DateTime } from "../external/DateTime.sol";

import { StringConversionUtils } from "./StringConversionUtils.sol";

pragma solidity ^0.8.18;

library DateParsing {
    
    using StringConversionUtils for string;

    /**
     * @notice Iterates through every character in the date string and splits the string at each dash, "T", or colon. Function will revert
     * if there are not 6 substrings formed from the split. The substrings are then converted to uints and passed to the DateTime lib
     * to get the unix timestamp. This function is SPECIFIC TO THE DATE FORMAT YYYY-MM-DDTHH:MM:SS, not suitable for use with other date
     * formats. It returns UTC timestamps.
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
            extractedStrings[5].stringToUint(0)     // second
        );
    }
}