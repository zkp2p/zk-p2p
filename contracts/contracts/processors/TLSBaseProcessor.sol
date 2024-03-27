//SPDX-License-Identifier: MIT

import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { SignatureChecker } from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

import { INullifierRegistry } from "./nullifierRegistries/INullifierRegistry.sol";

pragma solidity ^0.8.18;

contract TLSBaseProcessor is Ownable {

    using SignatureChecker for address;
    using ECDSA for bytes32;

    /* ============ Modifiers ============ */
    modifier onlyRamp() {
        require(msg.sender == ramp, "Only Ramp can call this function");
        _;
    }

    /* ============ State Variables ============ */
    address public immutable ramp;
    string public endpoint;
    string public host;

    INullifierRegistry public nullifierRegistry;
    uint256 public timestampBuffer;

    /* ============ Constructor ============ */
    constructor(
        address _ramp,
        INullifierRegistry _nullifierRegistry,
        uint256 _timestampBuffer,
        string memory _endpoint,
        string memory _host
    )
        Ownable()
    {
        ramp = _ramp;
        endpoint = _endpoint;
        host = _host;

        nullifierRegistry = _nullifierRegistry;
        timestampBuffer = _timestampBuffer;
    }

    /* ============ External Functions ============ */

    /**
     * @notice ONLY OWNER: Sets the timestamp buffer for validated TLS calls. This is the amount of time in seconds
     * that the timestamp can be off by and still be considered valid. Necessary to build in flexibility with L2
     * timestamps.
     *
     * @param _timestampBuffer    The timestamp buffer for validated TLS calls
     */
    function setTimestampBuffer(uint256 _timestampBuffer) external onlyOwner {
        timestampBuffer = _timestampBuffer;
    }

    /* ============ Internal Functions ============ */

    function _validateTLSEndpoint(
        string memory _expectedEndpoint,
        string memory _passedEndpoint
    )
        internal
        pure
    {
        require(
            keccak256(abi.encode(_expectedEndpoint)) == keccak256(abi.encode(_passedEndpoint)),
            "Endpoint does not match expected"
        );
    }

    function _validateTLSHost(
        string memory _expectedHost,
        string memory _passedHost
    )
        internal
        pure
    {
        require(
            keccak256(abi.encode(_expectedHost)) == keccak256(abi.encode(_passedHost)),
            "Host does not match expected"
        );
    }

    function _validateAndAddNullifier(bytes32 _nullifier) internal {
        require(!nullifierRegistry.isNullified(_nullifier), "Nullifier has already been used");
        nullifierRegistry.addNullifier(_nullifier);
    }

    function _isValidVerifierSignature(
        bytes memory _message,
        bytes memory _signature,
        address _verifier
    )
        internal
        view
        returns(bool)
    {
        bytes32 verifierPayload = keccak256(_message).toEthSignedMessageHash();

        return _verifier.isValidSignatureNow(verifierPayload, _signature);
    }
}
