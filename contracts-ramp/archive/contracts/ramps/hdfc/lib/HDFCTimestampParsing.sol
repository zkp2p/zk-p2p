//SPDX-License-Identifier: MIT

import { DateTime } from "../../../external/DateTime.sol";

import { StringConversionUtils } from "../../../lib/StringConversionUtils.sol";

pragma solidity ^0.8.18;

library HDFCTimestampParsing {

    using StringConversionUtils for string;

    /**
     * @notice Iterates through every character in the date string and splits the string at each space or colon. Function will revert
     * if there are not 8 substrings formed from the split. The substrings are then converted to uints and passed to the DateTime lib
     * to get the unix timestamp. This function is specific to the date format used by HDFC, not suitable for use with other date formats.
     */
    function _dateStringToTimestamp(string memory _dateString) internal pure returns (uint256) {
        string[8] memory extractedStrings;
        uint256 breakCounter;
        uint256 lastBreak;
        for (uint256 i = 0; i < bytes(_dateString).length; i++) {
            if (bytes(_dateString)[i] == 0x20 || bytes(_dateString)[i] == 0x3a) {
                extractedStrings[breakCounter] = _dateString.substring(lastBreak, i);
                lastBreak = i + 1;
                breakCounter++;
            }
        }
        // Add last substring to array
        extractedStrings[breakCounter] = _dateString.substring(lastBreak, bytes(_dateString).length);

        // Check that exactly 8 substrings were found (string is split at 7 different places)
        require(breakCounter == 7, "Invalid date string");

        uint256 unOffsetTimestamp = DateTime.timestampFromDateTime(
            extractedStrings[3].stringToUint(0), // year
            _parseMonth(extractedStrings[2]), // month
            extractedStrings[1].stringToUint(0), // day
            extractedStrings[4].stringToUint(0), // hour
            extractedStrings[5].stringToUint(0), // minute
            extractedStrings[6].stringToUint(0) // second
        );

        return _calculateTimestampWithOffset(unOffsetTimestamp, extractedStrings[7]);
    }

    /**
     * @notice Adds or subtracts an offset from the calculated unOffset timestamp based on the timezone offset string. The timezone offset
     * string is of the format "+0530" or "-0530" where the first character is either a "+" or a "-" and the next 4 characters are hhmm. If
     * the _timeOffsetString is "+0530" then we subtract 5 hours and 30 minutes (19800s) from the unOffset timestamp, to get a GMT timestamp.
     * We constrain the _timeOffsetString to be 5 characters long to be of the format +/-hhmm.
     *
     * @param unOffsetTimestamp     The unix timestamp without any timezone offset applied
     * @param _timeOffsetString     The timezone offset string indicating the magnitude and direction of the timezone offset
     */
    function _calculateTimestampWithOffset(uint256 unOffsetTimestamp, string memory _timeOffsetString) internal pure returns (uint256) {
        require(bytes(_timeOffsetString).length == 5, "Invalid timezone offset");
        uint256 tzHours = _timeOffsetString.substring(1, 3).stringToUint(0);
        uint256 tzMinutes = _timeOffsetString.substring(3, 5).stringToUint(0);

        uint256 rawOffset = tzHours * 3600 + tzMinutes * 60;

        // Check if tz offset is positive or negative relative to GMT, 0x2b is the hex value for "+" meaning the tz is ahead of GMT and must
        // be subtracted
        bytes1 _offsetDirection = bytes(_timeOffsetString.substring(0, 1))[0];
        return _offsetDirection == 0x2b ? unOffsetTimestamp - rawOffset : unOffsetTimestamp + rawOffset;
    }

    function _parseMonth(string memory _month) internal pure returns (uint256) {
        if (keccak256(abi.encodePacked(_month)) == keccak256("Jan")) {
            return 1;
        } else if (keccak256(abi.encodePacked(_month)) == keccak256("Feb")) {
            return 2;
        } else if (keccak256(abi.encodePacked(_month)) == keccak256("Mar")) {
            return 3;
        } else if (keccak256(abi.encodePacked(_month)) == keccak256("Apr")) {
            return 4;
        } else if (keccak256(abi.encodePacked(_month)) == keccak256("May")) {
            return 5;
        } else if (keccak256(abi.encodePacked(_month)) == keccak256("Jun")) {
            return 6;
        } else if (keccak256(abi.encodePacked(_month)) == keccak256("Jul")) {
            return 7;
        } else if (keccak256(abi.encodePacked(_month)) == keccak256("Aug")) {
            return 8;
        } else if (keccak256(abi.encodePacked(_month)) == keccak256("Sep")) {
            return 9;
        } else if (keccak256(abi.encodePacked(_month)) == keccak256("Oct")) {
            return 10;
        } else if (keccak256(abi.encodePacked(_month)) == keccak256("Nov")) {
            return 11;
        } else if (keccak256(abi.encodePacked(_month)) == keccak256("Dec")) {
            return 12;
        } else {
            revert("Invalid month");
        }
    }
}
