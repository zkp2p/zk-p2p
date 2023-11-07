//SPDX-License-Identifier: MIT

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { IKeyHashAdapter } from "./keyHashAdapters/IKeyHashAdapter.sol";
import { INullifierRegistry } from "./nullifierRegistries/INullifierRegistry.sol";

pragma solidity ^0.8.18;

contract BaseProcessor is Ownable {

    /* ============ Modifiers ============ */
    modifier onlyRamp() {
        require(msg.sender == ramp, "Only Ramp can call this function");
        _;
    }

    /* ============ State Variables ============ */
    address public immutable ramp;
    IKeyHashAdapter public mailserverKeyHashAdapter;
    INullifierRegistry public nullifierRegistry;
    bytes public emailFromAddress;

    /* ============ Constructor ============ */
    constructor(
        address _ramp,
        IKeyHashAdapter _mailserverKeyHashAdapter,
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

    function setMailserverKeyHashAdapter(IKeyHashAdapter _mailserverKeyHashAdapter) external onlyOwner {
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

    function getMailserverKeyHash() public view returns (bytes32) {
        return IKeyHashAdapter(mailserverKeyHashAdapter).mailserverKeyHash();
    }

    /* ============ Internal Functions ============ */

    function _validateAndAddNullifier(bytes32 _nullifier) internal {
        require(!nullifierRegistry.isNullified(_nullifier), "Nullifier has already been used");
        nullifierRegistry.addNullifier(_nullifier);
    }

    // stringToUint is used to convert a string like "45" to a uint256 4
    function _stringToUint(string memory s, uint256 expectedDecimals) internal pure returns (uint256) {
        bytes memory b = bytes(s);
        uint256 result = 0;
        bool decimals = false;
        uint256 decimalPlaces;
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

        // If expected decimals is 0 and there are decimals will revert, otherwise adds missing zeroes to end of number
        return result * (10 ** (expectedDecimals - decimalPlaces));
    }
}
