//SPDX-License-Identifier: MIT

import { StringConversionUtils } from "../lib/StringConversionUtils.sol";

pragma solidity ^0.8.18;

contract StringConversionUtilsMock {

    using StringConversionUtils for string;

    function stringToUint(string memory _s, uint256 _desiredDecimals) public pure returns (uint256) {
        return _s.stringToUint(_desiredDecimals);
    }

    function stringToUintDefinedCharacter(
        string memory _s,
        bytes1 _decimalCharacter,
        uint256 _desiredDecimals
    )
        public
        pure
        returns (uint256)
    {
        return _s.stringToUint(_decimalCharacter, _desiredDecimals);
    }
}
