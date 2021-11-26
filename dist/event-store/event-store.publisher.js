"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventStorePublisher = void 0;
const os_1 = require("os");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const enum_1 = require("../enum");
class EventStorePublisher {
    constructor(eventStore, config) {
        this.eventStore = eventStore;
        this.config = config;
        this.logger = new common_1.Logger(this.constructor.name);
        this.onPublishFail = () => (0, rxjs_1.empty)();
        if (config.onPublishFail) {
            this.onPublishFail = config.onPublishFail;
        }
    }
    writeEvents(events, context = {}) {
        const { streamName = context?.streamName ||
            this.getStreamName(events[0].metadata.correlation_id), expectedVersion = enum_1.ExpectedVersion.Any, streamMetadata, expectedMetadataVersion = enum_1.ExpectedVersion.Any, } = context;
        if (streamMetadata) {
            this.eventStore.writeMetadata(streamName, expectedMetadataVersion, streamMetadata);
        }
        const eventCount = events.length;
        this.logger.debug(`Write ${eventCount} events to stream ${streamName} with expectedVersion ${expectedVersion}`);
        return this.eventStore
            .writeEvents(streamName, events, expectedVersion)
            .pipe((0, operators_1.catchError)((err) => (this.onPublishFail && this.onPublishFail(err, events, this)) ||
            (0, rxjs_1.throwError)(err)))
            .toPromise();
    }
    getStreamName(correlationId) {
        const defaultName = process.argv?.[1]
            ? (0, path_1.basename)(process.argv?.[1], (0, path_1.extname)(process.argv?.[1]))
            : `${(0, os_1.hostname)()}_${process.argv?.[0] || 'unknown'}`;
        return `${this.config.serviceName || defaultName}-${correlationId}`;
    }
    async publish(event, context) {
        return await this.writeEvents([event], context);
    }
    async publishAll(events, context) {
        return await this.writeEvents(events, context);
    }
}
exports.EventStorePublisher = EventStorePublisher;
