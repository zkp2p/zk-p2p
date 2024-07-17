//SPDX-License-Identifier: MIT

import { IVerifyTicketProcessor } from "./IVerifyTicketProcessor.sol";

pragma solidity ^0.8.18;

interface IEventRegistry {
    function addEvent(IVerifyTicketProcessor.Event memory _eventInfo) external returns(bytes32);

    function getEventInfo(bytes32 _eventId) external view returns(IVerifyTicketProcessor.Event memory);
    function getEventStartTime(bytes32 _eventId) external view returns(uint256);
}
