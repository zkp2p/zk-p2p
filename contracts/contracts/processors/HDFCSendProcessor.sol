//SPDX-License-Identifier: MIT

import { StringUtils } from "@zk-email/contracts/utils/StringUtils.sol";

import { BaseProcessor } from "./BaseProcessor.sol";
import { Groth16Verifier } from "../verifiers/hdfc_send_verifier.sol";
import { IKeyHashAdapter } from "./keyHashAdapters/IKeyHashAdapter.sol";
import { INullifierRegistry } from "./nullifierRegistries/INullifierRegistry.sol";
import { IHDFCSendProcessor } from "../interfaces/IHDFCSendProcessor.sol";
import { StringConversionUtils } from "../lib/StringConversionUtils.sol";

import "hardhat/console.sol";

pragma solidity ^0.8.18;

contract HDFCSendProcessor is Groth16Verifier, IHDFCSendProcessor, BaseProcessor {
    
    using StringUtils for uint256[];
    using StringConversionUtils for string;

    /* ============ Constants ============ */
    uint256 constant PACK_SIZE = 7;
    uint256 constant SECONDS_PER_DAY = 24 * 60 * 60;
    uint256 constant SECONDS_PER_HOUR = 60 * 60;
    uint256 constant SECONDS_PER_MINUTE = 60;
    int256 constant OFFSET19700101 = 2440588;
    uint256 constant IST_OFFSET = 19800;

    /* ============ Constructor ============ */
    constructor(
        address _ramp,
        IKeyHashAdapter _hdfcMailserverKeyHashAdapter,
        INullifierRegistry _nullifierRegistry,
        string memory _emailFromAddress
    )
        Groth16Verifier()
        BaseProcessor(_ramp, _hdfcMailserverKeyHashAdapter, _nullifierRegistry, _emailFromAddress)
    {}
    
    /* ============ External Functions ============ */
    function processProof(
        IHDFCSendProcessor.SendProof calldata _proof
    )
        public
        override
        onlyRamp
        returns(uint256 amount, uint256 timestamp, bytes32 offRamperIdHash, bytes32 intentHash)
    {
        require(this.verifyProof(_proof.a, _proof.b, _proof.c, _proof.signals), "Invalid Proof"); // checks effects iteractions, this should come first

        require(bytes32(_proof.signals[0]) == getMailserverKeyHash(), "Invalid mailserver key hash");

        // Signals [1:4] are the packed from email address
        string memory fromEmail = _parseSignalArray(_proof.signals, 1, 4);
        require(keccak256(abi.encodePacked(fromEmail)) == keccak256(emailFromAddress), "Invalid email from address");

        // Signals [4:5] is the packed amount, since this is a USDC amount we want to make sure the returned number is
        // properly padded to 6 decimals. If the parsed has more than 6 figures to the right of the decimal it will revert
        amount = _parseSignalArray(_proof.signals, 4, 6).stringToUint(6);

        // Signals [6:11] are the packed timestamp, the timestamp is returned as a string in the format, , that we need to
        // parse and convert to a unix timestamp
        string memory rawTimestamp = _parseSignalArray(_proof.signals, 6, 11);
        timestamp = _dateStringToTimestamp(rawTimestamp);

        // Signals [11] is the packed offRamperIdHash
        offRamperIdHash = bytes32(_proof.signals[11]);

        // Check if email has been used previously, if not nullify it so it can't be used again
        _validateAndAddNullifier(bytes32(_proof.signals[12]));

        // Signals [13] is intentHash
        intentHash = bytes32(_proof.signals[13]);
    }

    /* ============ Internal Functions ============ */

    function _parseSignalArray(uint256[14] calldata _signals, uint8 _from, uint8 _to) internal pure returns (string memory) {
        uint256[] memory signalArray = new uint256[](_to - _from);
        for (uint256 i = _from; i < _to; i++) {
            signalArray[i - _from] = _signals[i];
        }

        return signalArray.convertPackedBytesToString(signalArray.length * PACK_SIZE, PACK_SIZE);
    }

    function _dateStringToTimestamp(string memory _dateString) internal view returns (uint256) {
        string[8] memory extractedStrings;
        uint256 breakCounter;
        uint256 lastBreak;
        for (uint256 i = 0; i < bytes(_dateString).length; i++) {
            if (bytes(_dateString)[i] == 0x20 || bytes(_dateString)[i] == 0x3a) {
                extractedStrings[breakCounter] = _substring(_dateString, lastBreak, i);
                console.logString(_substring(_dateString, lastBreak, i));
                lastBreak = i + 1;
                breakCounter++;
            }
        }

        return timestampFromDateTime(
            extractedStrings[3].stringToUint(0), // year
            11, // month
            extractedStrings[1].stringToUint(0), // day
            extractedStrings[4].stringToUint(0), // hour
            extractedStrings[5].stringToUint(0), // minute
            extractedStrings[6].stringToUint(0) // second
        ) - IST_OFFSET;
    }

    function _substring(string memory str, uint startIndex, uint endIndex) internal pure returns (string memory ) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex-startIndex);
        for(uint i = startIndex; i < endIndex; i++) {
            result[i-startIndex] = strBytes[i];
        }
        return string(result);
    }

    // From https://github.com/RollaProject/solidity-datetime/blob/master/contracts/DateTime.sol

    // ------------------------------------------------------------------------
    // Calculate the number of days from 1970/01/01 to year/month/day using
    // the date conversion algorithm from
    //   http://aa.usno.navy.mil/faq/docs/JD_Formula.php
    // and subtracting the offset 2440588 so that 1970/01/01 is day 0
    //
    // days = day
    //      - 32075
    //      + 1461 * (year + 4800 + (month - 14) / 12) / 4
    //      + 367 * (month - 2 - (month - 14) / 12 * 12) / 12
    //      - 3 * ((year + 4900 + (month - 14) / 12) / 100) / 4
    //      - offset
    // ------------------------------------------------------------------------
    function _daysFromDate(uint256 year, uint256 month, uint256 day) internal pure returns (uint256 _days) {
        require(year >= 1970);
        int256 _year = int256(year);
        int256 _month = int256(month);
        int256 _day = int256(day);

        int256 __days = _day - 32075 + (1461 * (_year + 4800 + (_month - 14) / 12)) / 4
            + (367 * (_month - 2 - ((_month - 14) / 12) * 12)) / 12
            - (3 * ((_year + 4900 + (_month - 14) / 12) / 100)) / 4 - OFFSET19700101;

        _days = uint256(__days);
    }

    function timestampFromDateTime(
        uint256 year,
        uint256 month,
        uint256 day,
        uint256 hour,
        uint256 minute,
        uint256 second
    )
        internal
        pure
        returns (uint256 timestamp)
    {
        timestamp = _daysFromDate(year, month, day) * SECONDS_PER_DAY + hour * SECONDS_PER_HOUR
            + minute * SECONDS_PER_MINUTE + second;
    }
}
