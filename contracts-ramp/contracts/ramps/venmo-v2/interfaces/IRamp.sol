//SPDX-License-Identifier: MIT

import { Ramp } from "../../venmo-v1/Ramp.sol";

pragma solidity ^0.8.18;

interface IRamp {
    function getAccountInfo(address _account) external view returns (Ramp.AccountInfo memory);
}
