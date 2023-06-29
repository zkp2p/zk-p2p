import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

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

    function decimals() public view override returns (uint8) {
        return 6;
    }
}
