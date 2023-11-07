//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

// Building on zk-email's StringUtils library we add the ability to handle decimals when
// converting from string to Uint
library StringConversionUtils {
    
    /**
     * @notice Function that parses numbers returned as strings including floating point numbers. Returned floating point
     * numbers are to have the desired amount of decimal specified. If the stringified version of the floating point
     * number has more decimal places than desired then the function will revert in order to be maximally safe. If
     * the returned number has multiple floating points then the function will revert.
     *
     * Examples: _s = "12.34", _expectedDecimals = 6 => 12340000
     *           _s = "12.34", _expectedDecimals = 2 => 1234
     *           _s = "12.34", _expectedDecimals = 1 => REVERT (we never want loss of precision only addition)
     *           _s = "12.34.56", _expectedDecimals = 6 => REVERT (Invalid number)
     *
     * @param _s                    String being processed
     * @param _desiredDecimals      Desired amount of decimal places
     */
    function stringToUint(string memory _s, uint256 _desiredDecimals) internal pure returns (uint256) {
        bytes memory b = bytes(_s);

        uint256 result = 0;
        uint256 decimalPlaces = 0;

        bool decimals = false;
        for (uint256 i = 0; i < b.length; i++) {
            if (b[i] >= 0x30 && b[i] <= 0x39) {
                result = result * 10 + (uint256(uint8(b[i])) - 48);
            }

            if (decimals) {
                decimalPlaces++;
            }

            if (b[i] == 0x2E) {
                require(decimals == false, "String has multiple decimals");
                decimals = true;
            }
        }

        require(decimalPlaces <= _desiredDecimals, "String has too many decimal places");
        return result * (10 ** (_desiredDecimals - decimalPlaces));
    }
}
