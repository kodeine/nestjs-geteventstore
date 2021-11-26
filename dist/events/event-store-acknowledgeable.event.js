"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventStoreAcknowledgeableEvent = void 0;
const index_1 = require("./index");
class EventStoreAcknowledgeableEvent extends index_1.EventStoreEvent {
    ack() {
        return Promise.resolve();
    }
    nack(action, reason) {
        return Promise.resolve();
    }
}
exports.EventStoreAcknowledgeableEvent = EventStoreAcknowledgeableEvent;
