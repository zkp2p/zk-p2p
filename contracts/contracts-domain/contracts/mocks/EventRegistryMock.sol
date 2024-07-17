//SPDX-License-Identifier: MIT

import { IEventRegistry } from "../interfaces/IEventRegistry.sol";
import { IVerifyTicketProcessor } from "../interfaces/IVerifyTicketProcessor.sol";

pragma solidity ^0.8.18;

contract EventRegistryMock is IEventRegistry {
    mapping(bytes32=>IVerifyTicketProcessor.Event) public events;

    function addEvent(IVerifyTicketProcessor.Event memory _eventInfo) external returns(bytes32) {
        bytes32 eventId = keccak256(abi.encodePacked(_eventInfo.rawId));
        events[eventId] = _eventInfo;
        return eventId;
    }

    function getEventInfo(bytes32 _eventId) external view returns(IVerifyTicketProcessor.Event memory) {
        return events[_eventId];
    }

    function getEventStartTime(bytes32 _eventId) external view returns(uint256) {
        return events[_eventId].startTime;
    }
}
