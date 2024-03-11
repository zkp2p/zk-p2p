//SPDX-License-Identifier: MIT

import { WiseTimestampParsing } from "../lib/WiseTimestampParsing.sol";

pragma solidity ^0.8.18;

contract WiseTimestampParsingMock {

    /**
     * @notice Iterates through every character in the date string and splits the string at each space or colon. Function will revert
     * if there are not 8 substrings formed from the split. The substrings are then converted to uints and passed to the DateTime lib
     * to get the unix timestamp. This function is specific to the date format used by Wise, not suitable for use with other date formats.
     */
    function dateStringToTimestamp(string memory _dateString) external pure returns (uint256) {
        return WiseTimestampParsing._dateStringToTimestamp(_dateString);
    }
}
