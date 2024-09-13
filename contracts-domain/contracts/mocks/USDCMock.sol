//SPDX-License-Identifier: MIT

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

pragma solidity ^0.8.18;

contract USDCMock is ERC20 {

    constructor(
        uint256 _mintAmount,
        string memory name,
        string memory symbol
    )
        ERC20(name, symbol)
    {
        _mint(msg.sender, _mintAmount);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
