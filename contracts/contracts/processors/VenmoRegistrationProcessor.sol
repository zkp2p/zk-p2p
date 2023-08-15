import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { IRegistrationProcessor } from "../interfaces/IRegistrationProcessor.sol";
import { ProofParsingUtils } from "../lib/ProofParsingUtils.sol";
import { VenmoRegistrationVerifier } from "../verifiers/VenmoRegistrationVerifier.sol";

pragma solidity ^0.8.18;

contract VenmoRegistrationProcessor is VenmoRegistrationVerifier, IRegistrationProcessor, Ownable {

    using ProofParsingUtils for string;
    using ProofParsingUtils for uint256[5];

    /* ============ State Variables ============ */
    uint256[17] public venmoMailserverKeys;
    bytes public emailFromAddress;

    /* ============ Constructor ============ */
    constructor(
        uint256[17] memory _venmoMailserverKeys,
        string memory _emailFromAddress
    )
        VenmoRegistrationVerifier()
        Ownable()
    {
        require(bytes(_emailFromAddress).length == 35, "Email from address not properly padded");

        venmoMailserverKeys = _venmoMailserverKeys;
        emailFromAddress = bytes(_emailFromAddress);
    }

    /* ============ External Functions ============ */

    function setVenmoMailserverKeys(uint256[17] memory _venmoMailserverKeys) external onlyOwner {
        venmoMailserverKeys = _venmoMailserverKeys;
    }

    /* ============ External View Functions ============ */
    function processProof(
        uint[2] memory _a,
        uint[2][2] memory _b,
        uint[2] memory _c,
        uint[45] memory _signals
    )
        public
        view
        override
        returns(uint256 onRamperId, bytes32 onRamperIdHash)
    {
        require(verifyProof(_a, _b, _c, _signals), "Invalid Proof"); // checks effects iteractions, this should come first

        // Signals [0:5] are the packed from email address
        string memory fromEmail = _parseSignalArray(_signals, 0);
        require(keccak256(abi.encodePacked(fromEmail)) == keccak256(emailFromAddress), "Invalid email from address");

        // Signals [5:10] is the packed onRamperId
        onRamperId = _parseSignalArray(_signals, 5).stringToUint256();

        // Signals [10] is the packed onRamperIdHsdh
        onRamperIdHash = bytes32(_signals[10]);

        // Signals [11:28] are modulus.
        for (uint256 i = 11; i < 28; i++) {
            require(_signals[i] == venmoMailserverKeys[i - 11], "Invalid: RSA modulus not matched");
        }
    }

    function getVenmoMailserverKeys() external view returns (uint256[17] memory) {
        return venmoMailserverKeys;
    }

    function getEmailFromAddress() external view returns (bytes memory) {
        return emailFromAddress;
    }

    /* ============ Internal Functions ============ */

    function _parseSignalArray(uint256[45] memory _signals, uint8 _from) internal pure returns (string memory) {
        uint256[5] memory signalArray;
        for (uint256 i = _from; i < _from + 5; i++) {
            signalArray[i - _from] = _signals[i];
        }

        return signalArray.convertPackedBytesToBytes(5);
    }
}
