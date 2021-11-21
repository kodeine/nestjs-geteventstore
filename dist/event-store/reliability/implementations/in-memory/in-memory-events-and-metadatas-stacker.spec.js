"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const in_memory_events_and_metadatas_stacker_1 = require("./in-memory-events-and-metadatas-stacker");
const db_client_1 = require("@eventstore/db-client");
const common_1 = require("@nestjs/common");
describe('InMemoryEventsAndMetadatasStacker', () => {
    let service;
    jest.mock('@nestjs/common');
    beforeEach(() => {
        jest.spyOn(common_1.Logger, 'log').mockImplementation(() => null);
        jest.spyOn(common_1.Logger, 'error').mockImplementation(() => null);
        jest.spyOn(common_1.Logger, 'debug').mockImplementation(() => null);
        service = new in_memory_events_and_metadatas_stacker_1.default();
    });
    describe('when stacking events', () => {
        it('should be able to add a new element at the end of the fifo', () => {
            let event = getDumbEvent('1');
            let events = [event];
            let stream = 'poj';
            let expectedVersion = { expectedRevision: db_client_1.ANY };
            const batch1 = {
                events,
                stream,
                expectedVersion,
            };
            event = getDumbEvent('2');
            events = [event];
            stream = 'poj';
            expectedVersion = { expectedRevision: db_client_1.ANY };
            const batch2 = {
                events,
                stream,
                expectedVersion,
            };
            service.putEventsInWaitingLine(batch1);
            service.putEventsInWaitingLine(batch2);
            expect(service.getFirstOutFromEventsBatchesWaitingLine().events[0].id).toEqual('1');
            expect(service.getFirstOutFromEventsBatchesWaitingLine().events[0].id).not.toEqual('2');
        });
        it('should not fail when getting first out from waiting line and line is empty', () => {
            expect(service.getFirstOutFromEventsBatchesWaitingLine()).toBeNull();
        });
        it('should be able to give the fifo length ', () => {
            const batch1 = getDumbBatch('1', 'poj');
            const batch2 = getDumbBatch('2', 'oiu');
            service.putEventsInWaitingLine(batch1);
            service.putEventsInWaitingLine(batch2);
            expect(service.getEventBatchesWaitingLineLength()).toEqual(2);
        });
        it('should be able to remove the first element of the waiting line', () => {
            const batch1 = getDumbBatch('1', 'poj');
            const batch2 = getDumbBatch('2', 'oiu');
            service.putEventsInWaitingLine(batch1);
            service.putEventsInWaitingLine(batch2);
            const unstackedBatch1 = service.shiftEventsBatchFromWaitingLine();
            const unstackedBatch2 = service.shiftEventsBatchFromWaitingLine();
            expect(unstackedBatch1.stream).toEqual('poj');
            expect(unstackedBatch2.stream).toEqual('oiu');
            expect(service.getEventBatchesWaitingLineLength()).toEqual(0);
        });
    });
    describe('when stacking metadatas', () => {
        it('should be able to add a new element at the end of the fifo', () => {
            const metadatasContextDatas1 = getDumbMetadata('1');
            const metadatasContextDatas2 = getDumbMetadata('2');
            service.putMetadatasInWaitingLine(metadatasContextDatas1);
            service.putMetadatasInWaitingLine(metadatasContextDatas2);
            expect(service.getFirstOutFromMetadatasWaitingLine().streamName).toEqual('1');
            expect(service.getFirstOutFromMetadatasWaitingLine().streamName).not.toEqual('2');
        });
        it('should not fail when getting first out from waiting line and line is empty', () => {
            expect(service.getFirstOutFromMetadatasWaitingLine()).toBeNull();
        });
        it('should be able to give the fifo length ', () => {
            const metadatasContextDatas1 = getDumbMetadata('1');
            const metadatasContextDatas2 = getDumbMetadata('2');
            service.putMetadatasInWaitingLine(metadatasContextDatas1);
            service.putMetadatasInWaitingLine(metadatasContextDatas2);
            expect(service.getMetadatasWaitingLineLength()).toEqual(2);
        });
        it('should be able to remove the first element of the waiting line', () => {
            const metadatasContextDatas1 = getDumbMetadata('1');
            const metadatasContextDatas2 = getDumbMetadata('2');
            service.putMetadatasInWaitingLine(metadatasContextDatas1);
            service.putMetadatasInWaitingLine(metadatasContextDatas2);
            const metadataGot1 = service.shiftMetadatasFromWaitingLine();
            const metadataGot2 = service.shiftMetadatasFromWaitingLine();
            expect(metadataGot1.streamName).toEqual('1');
            expect(metadataGot2.streamName).toEqual('2');
            expect(service.getEventBatchesWaitingLineLength()).toEqual(0);
        });
    });
});
function getDumbBatch(eventId, stream) {
    const events = [getDumbEvent(eventId)];
    const expectedVersion = { expectedRevision: db_client_1.ANY };
    return {
        events,
        stream,
        expectedVersion,
    };
}
const getDumbEvent = (id) => {
    return {
        contentType: undefined,
        data: undefined,
        id: id ?? '',
        metadata: undefined,
        type: '',
    };
};
const getDumbMetadata = (streamName) => {
    return {
        metadata: undefined,
        streamName: streamName ?? '',
    };
};
