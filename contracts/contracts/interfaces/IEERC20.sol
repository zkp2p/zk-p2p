// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

interface IeERC20 {
    event Transfer(address indexed from, address indexed to);
    event Approval(address indexed owner, address indexed spender);
    event Mint(address indexed to, uint64 amount);

    // Returns the name of the token.
    function name() external view returns (string memory);

    // Returns the symbol of the token, usually a shorter version of the name.
    function symbol() external view returns (string memory);

    // Returns the total supply of the token.
    function totalSupply() external view returns (uint64);

    // Transfers an encrypted amount from the message sender address to the `to` address.
    function transfer(address to, einput encryptedAmount, bytes calldata inputProof) external returns (bool);

    // Transfers an amount from the message sender address to the `to` address.
    function transfer(address to, euint64 amount) external returns (bool);

    // Returns the balance handle of the specified wallet.
    function balanceOf(address wallet) external view returns (euint64);

    // Sets the `encryptedAmount` as the allowance of `spender` over the caller's tokens.
    function approve(address spender, einput encryptedAmount, bytes calldata inputProof) external returns (bool);

    // Sets the `amount` as the allowance of `spender` over the caller's tokens.
    function approve(address spender, euint64 amount) external returns (bool);

    // Returns the remaining number of tokens that `spender` is allowed to spend on behalf of the owner.
    function allowance(address owner, address spender) external view returns (euint64);

    // Transfers `encryptedAmount` tokens using the caller's allowance.
    function transferFrom(
        address from,
        address to,
        einput encryptedAmount,
        bytes calldata inputProof
    ) external returns (bool);

    // Transfers `amount` tokens using the caller's allowance.
    function transferFrom(address from, address to, euint64 amount) external returns (bool);
}
