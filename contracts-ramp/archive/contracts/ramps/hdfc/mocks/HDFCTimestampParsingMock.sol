//SPDX-License-Identifier: MIT

import { HDFCTimestampParsing } from "../lib/HDFCTimestampParsing.sol";

pragma solidity ^0.8.18;

contract HDFCTimestampParsingMock {

    /**
     * @notice Iterates through every character in the date string and splits the string at each space or colon. Function will revert
     * if there are not 8 substrings formed from the split. The substrings are then converted to uints and passed to the DateTime lib
     * to get the unix timestamp. This function is specific to the date format used by HDFC, not suitable for use with other date formats.
     */
    function dateStringToTimestamp(string memory _dateString) external pure returns (uint256) {
        return HDFCTimestampParsing._dateStringToTimestamp(_dateString);
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
    function _calculateTimestampWithOffset(uint256 unOffsetTimestamp, string memory _timeOffsetString) external pure returns (uint256) {
        return HDFCTimestampParsing._calculateTimestampWithOffset(unOffsetTimestamp, _timeOffsetString);
    }

    function _parseMonth(string memory _month) external pure returns (uint256) {
        return HDFCTimestampParsing._parseMonth(_month);
    }
}
