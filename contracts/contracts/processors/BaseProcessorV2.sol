//SPDX-License-Identifier: MIT

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { IKeyHashAdapterV2 } from "./keyHashAdapters/IKeyHashAdapterV2.sol";
import { INullifierRegistry } from "./nullifierRegistries/INullifierRegistry.sol";

pragma solidity ^0.8.18;

contract BaseProcessorV2 is Ownable {

    /* ============ Modifiers ============ */
    modifier onlyRamp() {
        require(msg.sender == ramp, "Only Ramp can call this function");
        _;
    }

    /* ============ State Variables ============ */
    address public immutable ramp;
    IKeyHashAdapterV2 public mailserverKeyHashAdapter;
    INullifierRegistry public nullifierRegistry;
    bytes public emailFromAddress;

    /* ============ Constructor ============ */
    constructor(
        address _ramp,
        IKeyHashAdapterV2 _mailserverKeyHashAdapter,
        INullifierRegistry _nullifierRegistry,
        string memory _emailFromAddress
    )
        Ownable()
    {
        ramp = _ramp;
        mailserverKeyHashAdapter = _mailserverKeyHashAdapter;
        nullifierRegistry = _nullifierRegistry;
        emailFromAddress = bytes(_emailFromAddress);
    }

    /* ============ External Functions ============ */

    function setMailserverKeyHashAdapter(IKeyHashAdapterV2 _mailserverKeyHashAdapter) external onlyOwner {
        mailserverKeyHashAdapter = _mailserverKeyHashAdapter;
    }

    /**
     * @notice ONLY OWNER: Sets the from email address for validated emails. Check that email address is properly
     * padded (if necessary). Padding will be dependent on if unpacking functions cut trailing 0s or not.
     *
     * @param _emailFromAddress    The from email address for validated emails, MUST BE PROPERLY PADDED
     */
    function setEmailFromAddress(string memory _emailFromAddress) external onlyOwner {
        emailFromAddress = bytes(_emailFromAddress);
    }

    /* ============ External Getters ============ */

    function getEmailFromAddress() external view returns (bytes memory) {
        return emailFromAddress;
    }

    function getMailserverKeyHashes() public view returns (bytes32[] memory) {
        return IKeyHashAdapterV2(mailserverKeyHashAdapter).getMailserverKeyHashes();
    }

    /* ============ Internal Functions ============ */

    function _validateAndAddNullifier(bytes32 _nullifier) internal {
        require(!nullifierRegistry.isNullified(_nullifier), "Nullifier has already been used");
        nullifierRegistry.addNullifier(_nullifier);
    }
}
