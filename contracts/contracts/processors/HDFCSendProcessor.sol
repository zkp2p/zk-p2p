//SPDX-License-Identifier: MIT

import { StringUtils } from "@zk-email/contracts/utils/StringUtils.sol";

import { DateTime } from "../external/DateTime.sol";

import { BaseProcessorV2 } from "./BaseProcessorV2.sol";
import { Groth16Verifier } from "../verifiers/hdfc_send_verifier.sol";
import { IKeyHashAdapterV2 } from "./keyHashAdapters/IKeyHashAdapterV2.sol";
import { INullifierRegistry } from "./nullifierRegistries/INullifierRegistry.sol";
import { IHDFCSendProcessor } from "../interfaces/IHDFCSendProcessor.sol";
import { StringConversionUtils } from "../lib/StringConversionUtils.sol";

pragma solidity ^0.8.18;

contract HDFCSendProcessor is Groth16Verifier, IHDFCSendProcessor, BaseProcessorV2 {
    
    using StringUtils for uint256[];
    using StringConversionUtils for string;

    /* ============ Constants ============ */
    uint256 constant PACK_SIZE = 7;
    uint256 constant IST_OFFSET = 19800;

    /* ============ Constructor ============ */
    constructor(
        address _ramp,
        IKeyHashAdapterV2 _hdfcMailserverKeyHashAdapter,
        INullifierRegistry _nullifierRegistry,
        string memory _emailFromAddress
    )
        Groth16Verifier()
        BaseProcessorV2(_ramp, _hdfcMailserverKeyHashAdapter, _nullifierRegistry, _emailFromAddress)
    {}
    
    /* ============ External Functions ============ */
    function processProof(
        IHDFCSendProcessor.SendProof calldata _proof
    )
        public
        override
        onlyRamp
        returns(
            uint256 amount,
            uint256 timestamp,
            bytes32 offRamperIdHash,
            bytes32 onRamperIdHash,
            bytes32 intentHash
        )
    {
        require(this.verifyProof(_proof.a, _proof.b, _proof.c, _proof.signals), "Invalid Proof"); // checks effects iteractions, this should come first

        require(isMailServerKeyHash(bytes32(_proof.signals[0])), "Invalid mailserver key hash");

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

        // Signals [11] is the packed onRamperIdHash
        onRamperIdHash = bytes32(_proof.signals[11]);

        // Signals [12] is the packed offRamperIdHash
        offRamperIdHash = bytes32(_proof.signals[12]);

        // Check if email has been used previously, if not nullify it so it can't be used again
        _validateAndAddNullifier(bytes32(_proof.signals[13]));

        // Signals [14] is intentHash
        intentHash = bytes32(_proof.signals[14]);
    }

    /* ============ Internal Functions ============ */

    function _parseSignalArray(uint256[15] calldata _signals, uint8 _from, uint8 _to) internal pure returns (string memory) {
        uint256[] memory signalArray = new uint256[](_to - _from);
        for (uint256 i = _from; i < _to; i++) {
            signalArray[i - _from] = _signals[i];
        }

        return signalArray.convertPackedBytesToString(signalArray.length * PACK_SIZE, PACK_SIZE);
    }

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
        // Check that exactly 8 substrings were found (string is split at 7 different places)
        require(breakCounter == 7, "Invalid date string");

        return DateTime.timestampFromDateTime(
            extractedStrings[3].stringToUint(0), // year
            _parseMonth(extractedStrings[2]), // month
            extractedStrings[1].stringToUint(0), // day
            extractedStrings[4].stringToUint(0), // hour
            extractedStrings[5].stringToUint(0), // minute
            extractedStrings[6].stringToUint(0) // second
        ) - IST_OFFSET;
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
