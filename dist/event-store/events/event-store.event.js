"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventStoreEvent = void 0;
const uuid_1 = require("uuid");
const write_event_dto_1 = require("../../dto/write-event.dto");
class EventStoreEvent extends write_event_dto_1.WriteEventDto {
    constructor(data, options) {
        super();
        this.data = data;
        this.metadata = options?.metadata || {};
        this.eventId = options?.eventId || (0, uuid_1.v4)();
        this.eventType = options?.eventType || this.constructor.name;
        this.eventStreamId = options?.eventStreamId ?? undefined;
        this.eventNumber = options?.eventNumber ?? undefined;
        this.originalEventId = options?.originalEventId ?? undefined;
    }
    getStream() {
        return this.eventStreamId || '';
    }
    getStreamCategory() {
        return this.eventStreamId?.split('-')[0] ?? '';
    }
    getStreamId() {
        return this.eventStreamId?.replace(/^[^-]*-/, '') ?? '';
    }
}
exports.EventStoreEvent = EventStoreEvent;
