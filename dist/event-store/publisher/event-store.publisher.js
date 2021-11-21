"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventStorePublisher = void 0;
const os_1 = require("os");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const event_store_service_interface_1 = require("../services/event-store.service.interface");
const db_client_1 = require("@eventstore/db-client");
const constants = require("@eventstore/db-client/dist/constants");
let EventStorePublisher = class EventStorePublisher {
    constructor(eventStoreService, config) {
        this.eventStoreService = eventStoreService;
        this.config = config;
        this.logger = new common_1.Logger(this.constructor.name);
    }
    async writeEvents(events, context = {}) {
        const { streamName = context?.streamName ||
            this.getStreamName(events[0].metadata.correlation_id), expectedRevision, streamMetadata, options, } = context;
        if (streamMetadata) {
            await this.eventStoreService.writeMetadata(streamName, streamMetadata, options);
        }
        const eventCount = events.length;
        this.logger.debug(`Write ${eventCount} events to stream ${streamName} with expectedVersion ${expectedRevision}`);
        return this.eventStoreService.writeEvents(streamName, events.map((event) => {
            return (0, db_client_1.jsonEvent)({
                id: event.eventId,
                type: event.eventType,
                metadata: event.metadata,
                data: event.data,
            });
        }), {
            expectedRevision: expectedRevision ?? constants.ANY,
        });
    }
    getStreamName(correlationId) {
        const defaultName = process.argv?.[1]
            ? (0, path_1.basename)(process.argv?.[1], (0, path_1.extname)(process.argv?.[1]))
            : `${(0, os_1.hostname)()}_${process.argv?.[0] || 'unknown'}`;
        return `${this.config.serviceName || defaultName}-${correlationId}`;
    }
    async publish(event, context) {
        return this.publishAll([event], context);
    }
    async publishAll(events, context) {
        return await this.writeEvents(events, context);
    }
};
EventStorePublisher = __decorate([
    __param(0, (0, common_1.Inject)(event_store_service_interface_1.EVENT_STORE_SERVICE)),
    __metadata("design:paramtypes", [Object, Object])
], EventStorePublisher);
exports.EventStorePublisher = EventStorePublisher;
