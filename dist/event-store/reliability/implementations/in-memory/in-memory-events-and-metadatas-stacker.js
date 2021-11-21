"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InMemoryEventsAndMetadatasStacker {
    constructor() {
        this.eventBatchesFifo = [];
        this.metadatasFifo = [];
    }
    shiftEventsBatchFromWaitingLine() {
        return this.eventBatchesFifo.shift();
    }
    getFirstOutFromEventsBatchesWaitingLine() {
        if (this.eventBatchesFifo.length === 0) {
            return null;
        }
        return this.eventBatchesFifo[0];
    }
    putEventsInWaitingLine(batch) {
        this.eventBatchesFifo.push(batch);
    }
    getEventBatchesWaitingLineLength() {
        return this.eventBatchesFifo.length;
    }
    shiftMetadatasFromWaitingLine() {
        return this.metadatasFifo.shift();
    }
    getFirstOutFromMetadatasWaitingLine() {
        if (this.metadatasFifo.length === 0) {
            return null;
        }
        return this.metadatasFifo[0];
    }
    getMetadatasWaitingLineLength() {
        return this.metadatasFifo.length;
    }
    putMetadatasInWaitingLine(metadata) {
        this.metadatasFifo.push(metadata);
    }
}
exports.default = InMemoryEventsAndMetadatasStacker;
