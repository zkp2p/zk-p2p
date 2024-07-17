//SPDX-License-Identifier: MIT

import { TMTimestampParsing } from "../../lib/TMTimestampParsing.sol";

pragma solidity ^0.8.18;

contract TMTimestampParsingMock {

    function dateStringToTimestamp(string memory _dateString) external pure returns (uint256) {
        return TMTimestampParsing._dateStringToTimestamp(_dateString);
    }
}
