"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventStoreAggregateRoot = void 0;
const cqrs_1 = require("../cqrs");
const enum_1 = require("../enum");
class EventStoreAggregateRoot extends cqrs_1.AggregateRoot {
    set streamName(streamName) {
        this._streamName = streamName;
    }
    set streamMetadata(streamMetadata) {
        this._streamMetadata = streamMetadata;
    }
    set maxAge(maxAge) {
        this._streamMetadata = {
            ...this._streamMetadata,
            $maxAge: maxAge,
        };
    }
    set maxCount(maxCount) {
        this._streamMetadata = {
            ...this._streamMetadata,
            $maxCount: maxCount,
        };
    }
    async commit(expectedVersion = enum_1.ExpectedVersion.Any, expectedMetadataVersion = enum_1.ExpectedVersion.Any) {
        this.logger.debug(`Aggregate will commit ${this.getUncommittedEvents().length} events in ${this.publishers.length} publishers`);
        const context = {
            expectedVersion,
            ...(this._streamName ? { streamName: this._streamName } : {}),
            ...(this._streamMetadata
                ? { streamMetadata: this._streamMetadata, expectedMetadataVersion }
                : {}),
        };
        for (const publisher of this.publishers) {
            await publisher(this.getUncommittedEvents(), context);
        }
        this.clearEvents();
        return this;
    }
}
exports.EventStoreAggregateRoot = EventStoreAggregateRoot;
