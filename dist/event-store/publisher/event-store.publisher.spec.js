"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_store_publisher_1 = require("./event-store.publisher");
const rxjs_1 = require("rxjs");
const event_store_service_1 = require("../services/event-store.service");
const constants = require("@eventstore/db-client/dist/constants");
const common_1 = require("@nestjs/common");
var spyOn = jest.spyOn;
describe('EventStorePublisher', () => {
    let publisher;
    let eventStore;
    let eventStoreService;
    let publisherConfig;
    const eventsStackerMock = {
        putEventsInWaitingLine: jest.fn(),
        shiftEventsBatchFromWaitingLine: jest.fn(),
        getFirstOutFromEventsBatchesWaitingLine: jest.fn(),
        getEventBatchesWaitingLineLength: jest.fn(),
        putMetadatasInWaitingLine: jest.fn(),
        getFirstOutFromMetadatasWaitingLine: jest.fn(),
        shiftMetadatasFromWaitingLine: jest.fn(),
        getMetadatasWaitingLineLength: jest.fn(),
    };
    beforeEach(() => {
        jest.resetAllMocks();
        jest.mock('@nestjs/common');
        jest.spyOn(common_1.Logger, 'log').mockImplementation(() => null);
        jest.spyOn(common_1.Logger, 'error').mockImplementation(() => null);
        jest.spyOn(common_1.Logger, 'debug').mockImplementation(() => null);
        publisherConfig = {};
        eventStore = {
            appendToStream: jest.fn(),
            setStreamMetadata: jest.fn(),
        };
        const eventStoreHealthIndicatorMock = {
            updateStatus: jest.fn(),
            check: jest.fn(),
        };
        eventStoreService = new event_store_service_1.EventStoreService(eventStore, {
            onConnectionFail: () => { },
        }, eventsStackerMock, eventStoreHealthIndicatorMock);
        publisher = new event_store_publisher_1.EventStorePublisher(eventStoreService, publisherConfig);
    });
    it('should be instanciated properly', () => {
        expect(publisher).toBeTruthy();
    });
    it('should give default context value when write events and no context given', async () => {
        spyOn(eventStore, 'appendToStream').mockImplementationOnce(() => {
            return null;
        });
        spyOn(eventStoreService, 'writeEvents');
        await eventStoreService.onModuleInit();
        await publisher.publish({
            data: undefined,
            metadata: {
                correlation_id: 'toto',
            },
        });
        expect(eventStoreService.writeEvents).toHaveBeenCalledWith(expect.anything(), expect.anything(), { expectedRevision: constants.ANY });
    });
    it('should write metadatas when metadata stream is given', async () => {
        spyOn(eventStore, 'setStreamMetadata');
        spyOn(eventStoreService, 'writeMetadata');
        const streamName = 'streamName';
        const streamMetadata = { truncateBefore: 'start' };
        const expectedRevision = constants.STREAM_EXISTS;
        const context = {
            streamName: streamName,
            expectedRevision: constants.ANY,
            streamMetadata,
            options: { expectedRevision },
        };
        await publisher.publish({
            data: undefined,
            metadata: {
                correlation_id: 'toto',
            },
        }, context);
        expect(eventStoreService.writeMetadata).toHaveBeenCalledWith(streamName, streamMetadata, context.options);
    });
    it('should publish single event the same way than multiple events when only 1 event is ', async () => {
        eventStore.appendToStream = jest.fn().mockReturnValue((0, rxjs_1.of)({}));
        spyOn(publisher, 'publishAll');
        await publisher.publish({
            data: undefined,
            metadata: {
                correlation_id: 'toto',
            },
        });
        expect(publisher.publishAll).toHaveBeenCalled();
    });
});
