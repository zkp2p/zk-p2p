import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import { IReceiveProcessor } from "../interfaces/IReceiveProcessor.sol";
import { ISendProcessor } from "../interfaces/ISendProcessor.sol";
import { Ramp } from "../Ramp.sol";

pragma solidity ^0.8.18;

contract RampMock is Ramp {

    bytes32 public configuredIntentHash;

    /* ============ Constructor ============ */
    constructor(
        address _owner,
        IERC20 _usdc,
        IReceiveProcessor _receiveProcessor,
        ISendProcessor _sendProcessor
    )
        Ramp(_owner, _usdc, _receiveProcessor, _sendProcessor)
    {}

    function _calculateIntentHash(
        bytes32 /*_venmoId*/,
        bytes32 /*_depositHash*/
    )
        internal
        view
        override
        returns (bytes32 intentHash)
    {
        return configuredIntentHash;
    }
}
