import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import { IReceiveProcessor } from "../interfaces/IReceiveProcessor.sol";
import { IRegistrationProcessor } from "../interfaces/IRegistrationProcessor.sol";
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
        IRegistrationProcessor _registrationProcessor,
        ISendProcessor _sendProcessor,
        uint256 _minDepositAmount,
        uint256 _convenienceRewardTimePeriod
    )
        Ramp(
            _owner,
            _usdc,
            _receiveProcessor,
            _registrationProcessor,
            _sendProcessor,
            _minDepositAmount,
            _convenienceRewardTimePeriod
        )
    {}
}
