"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_store_service_1 = require("./event-store.service");
const db_client_1 = require("@eventstore/db-client");
const errors_constant_1 = require("./errors.constant");
const common_1 = require("@nestjs/common");
var spyOn = jest.spyOn;
describe('EventStoreService', () => {
    let service;
    const persistentSubscriptionMock = {
        on: () => jest.fn(),
    };
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
    const eventStoreConnectorMock = {
        disconnect: jest.fn(),
        connect: jest.fn(),
        createPersistentSubscription: jest.fn(),
        connectToPersistentSubscription: () => persistentSubscriptionMock,
        updatePersistentSubscription: jest.fn(),
        appendToStream: jest.fn(),
        setStreamMetadata: jest.fn(),
        readStream: jest.fn(),
        updateProjection: jest.fn(),
        getStreamMetadata: jest.fn(),
        deletePersistentSubscription: jest.fn(),
        createContinuousProjection: jest.fn(),
    };
    const subsystemsMock = {
        subscriptions: {
            persistent: [
                {
                    stream: 'toto',
                    group: 'tutu',
                    settingsForCreation: {
                        subscriptionSettings: {
                            fromRevision: 'start',
                        },
                    },
                },
            ],
        },
        projections: [
            {
                mode: 'continuous',
                name: 'tutu',
                content: 'toto',
                file: 'theGoodFile',
            },
        ],
        onEvent: jest.fn(),
        onConnectionFail: jest.fn(),
    };
    const eventStoreHealthIndicatorMock = {
        updateStatus: jest.fn(),
        check: jest.fn(),
    };
    jest.mock('@nestjs/common');
    beforeEach(() => {
        jest.resetAllMocks();
        jest.spyOn(common_1.Logger, 'log').mockImplementationOnce(() => null);
        jest.spyOn(common_1.Logger, 'error').mockImplementationOnce(() => null);
        jest.spyOn(common_1.Logger, 'debug').mockImplementationOnce(() => null);
        service = new event_store_service_1.EventStoreService(eventStoreConnectorMock, subsystemsMock, eventsStackerMock, eventStoreHealthIndicatorMock);
    });
    describe('at init', () => {
        it('should be created', () => {
            expect(service).toBeTruthy();
        });
        it('should subscribe to given subscriptions in conf', async () => {
            service = new event_store_service_1.EventStoreService(eventStoreConnectorMock, subsystemsMock, eventsStackerMock, eventStoreHealthIndicatorMock);
            spyOn(service, 'subscribeToPersistentSubscriptions');
            await service.onModuleInit();
            expect(service.subscribeToPersistentSubscriptions).toHaveBeenCalled();
        });
        it('should try to write pending events when all is ok', async () => {
            spyOn(eventsStackerMock, 'getEventBatchesWaitingLineLength').mockReturnValueOnce(1);
            spyOn(eventsStackerMock, 'getFirstOutFromEventsBatchesWaitingLine').mockReturnValue({
                stream: 'tutu',
                events: [],
                expectedVersion: { expectedRevision: db_client_1.ANY },
            });
            spyOn(eventStoreConnectorMock, 'appendToStream').mockResolvedValue(null);
            await service.onModuleInit();
            expect(eventStoreConnectorMock.appendToStream).toHaveBeenCalled();
        });
        it('should try to write pending metadatas when all is ok', async () => {
            spyOn(eventsStackerMock, 'getMetadatasWaitingLineLength').mockReturnValueOnce(1);
            const metadata = getDumbMetadatas('abc');
            spyOn(eventsStackerMock, 'getFirstOutFromMetadatasWaitingLine').mockReturnValue(metadata);
            await service.onModuleInit();
            expect(eventStoreConnectorMock.setStreamMetadata).toHaveBeenCalled();
        });
    });
    describe('when upserting projections', () => {
        it('should upsert projections at init', async () => {
            spyOn(service, 'upsertProjections');
            await service.onModuleInit();
            expect(service.upsertProjections).toHaveBeenCalled();
        });
        it('should try to create projection at first', async () => {
            spyOn(service, 'createProjection').mockImplementationOnce(() => {
                throw { code: errors_constant_1.PROJECTION_ALREADY_EXIST_ERROR_CODE };
            });
            await service.onModuleInit();
            expect(service.createProjection).toHaveBeenCalled();
        });
        it('should try to update projection at if it already exists', async () => {
            spyOn(eventStoreConnectorMock, 'createContinuousProjection').mockImplementationOnce(() => {
                throw { code: errors_constant_1.PROJECTION_ALREADY_EXIST_ERROR_CODE };
            });
            spyOn(service, 'updateProjection');
            await service.onModuleInit();
            expect(service.updateProjection).toHaveBeenCalled();
        });
        it('should not try to update when projection does not already exist and creation raises error', async () => {
            spyOn(service, 'createProjection').mockImplementationOnce(() => {
                const UNKNOWN_ERROR = -666;
                throw { code: UNKNOWN_ERROR };
            });
            spyOn(service, 'updateProjection');
            try {
                await service.onModuleInit();
            }
            catch (e) {
            }
            expect(service.updateProjection).not.toHaveBeenCalled();
        });
        it('should raise an error when created has failed and does not already exist', async () => {
            spyOn(service, 'createProjection').mockImplementationOnce(() => {
                const UNKNOWN_ERROR = -666;
                throw { code: UNKNOWN_ERROR };
            });
            try {
                await service.onModuleInit();
            }
            catch (e) {
            }
            await expect(service.upsertProjections).rejects.toThrow();
        });
    });
    describe('when upsert a persistent subscription', () => {
        it('should try to create persistent subscription at first', async () => {
            spyOn(eventStoreConnectorMock, 'createPersistentSubscription');
            await service.onModuleInit();
            await expect(eventStoreConnectorMock.createPersistentSubscription).toHaveBeenCalled();
        });
        it('should update the persistent subscription when it already exists', async () => {
            spyOn(eventStoreConnectorMock, 'createPersistentSubscription').mockImplementationOnce(() => {
                throw { code: errors_constant_1.PERSISTENT_SUBSCRIPTION_ALREADY_EXIST_ERROR_CODE };
            });
            spyOn(eventStoreConnectorMock, 'updatePersistentSubscription');
            await service.onModuleInit();
            await expect(eventStoreConnectorMock.updatePersistentSubscription).toHaveBeenCalled();
        });
        it('should raise an error when creation failed for another reason than already exist', async () => {
            spyOn(eventStoreConnectorMock, 'createPersistentSubscription').mockImplementationOnce(() => {
                const UNKNOWN_ERROR = -666;
                throw { code: UNKNOWN_ERROR };
            });
            spyOn(eventStoreConnectorMock, 'updatePersistentSubscription');
            try {
                await service.onModuleInit();
            }
            catch (e) {
            }
            await expect(service.onModuleInit).rejects.toThrow();
            await expect(eventStoreConnectorMock.updatePersistentSubscription).not.toHaveBeenCalled();
        });
    });
    describe('about health', () => {
        it('should allow to get all subscriptions', async () => {
            await service.onModuleInit();
            const subscriptions = service.getPersistentSubscriptions();
            expect(subscriptions.length).toEqual(1);
        });
        it('should init its health status when all is ok at init', async () => {
            spyOn(eventStoreHealthIndicatorMock, 'updateStatus');
            await service.onModuleInit();
            expect(eventStoreHealthIndicatorMock.updateStatus).toHaveBeenCalledWith({
                connection: 'up',
                subscriptions: 'up',
            });
        });
        it('should init its health status when all is ok at init', async () => {
            spyOn(eventStoreHealthIndicatorMock, 'updateStatus');
            spyOn(service, 'upsertProjections').mockImplementation(() => {
                throw Error();
            });
            await service.onModuleInit();
            expect(eventStoreHealthIndicatorMock.updateStatus).toHaveBeenCalledWith({
                connection: 'down',
                subscriptions: 'down',
            });
        });
        it('should update connection health status when appending events raises error', async () => {
            let cpt = 2;
            spyOn(eventsStackerMock, 'getEventBatchesWaitingLineLength').mockImplementationOnce(() => {
                return cpt--;
            });
            spyOn(eventStoreConnectorMock, 'appendToStream').mockImplementationOnce(() => {
                throw Error();
            });
            spyOn(eventStoreHealthIndicatorMock, 'updateStatus');
            await service.writeEvents('testStream', [getDumbEvent()], {
                expectedRevision: db_client_1.ANY,
            });
            expect(eventStoreHealthIndicatorMock.updateStatus).toHaveBeenCalledWith({
                connection: 'down',
            });
        });
        it('should update status connection when appending metadata raises an error', async () => {
            spyOn(eventStoreHealthIndicatorMock, 'updateStatus');
            spyOn(eventsStackerMock, 'getMetadatasWaitingLineLength').mockReturnValueOnce(1);
            spyOn(eventStoreConnectorMock, 'setStreamMetadata').mockImplementationOnce(() => {
                throw Error();
            });
            const metadata = getDumbMetadatas('abc');
            await service.writeMetadata(metadata.streamName, metadata.metadata);
            expect(eventStoreHealthIndicatorMock.updateStatus).toHaveBeenCalledWith({
                connection: 'down',
            });
        });
    });
    describe('when adding callbacks to persistent subscriptions', () => {
        const persistentSubscriptionConfig = {
            group: '',
            stream: '',
            onError: jest.fn(),
            onSubscriptionStart: jest.fn(),
            onSubscriptionDropped: jest.fn(),
        };
        beforeEach(() => {
            jest.resetAllMocks();
        });
        [
            ['error', 'onError', persistentSubscriptionConfig.onError],
            [
                'confirmation',
                'onSubscriptionStart',
                persistentSubscriptionConfig.onSubscriptionStart,
            ],
            [
                'close',
                'onSubscriptionDropped',
                persistentSubscriptionConfig.onSubscriptionDropped,
            ],
        ].forEach(([emitType, callbackName, callback]) => {
            it(`should add the callback ${callbackName} to persistent subscription used when an ${emitType} is emitted`, async () => {
                spyOn(persistentSubscriptionMock, 'on');
                await service.subscribeToPersistentSubscriptions([
                    persistentSubscriptionConfig,
                ]);
                await expect(persistentSubscriptionMock.on).toHaveBeenCalledWith(emitType, callback);
            });
        });
    });
    describe('when connection raises an error', () => {
        it(`should catch the error and try to reconnect
		at module startup (interval of ${errors_constant_1.RECONNECTION_TRY_DELAY_IN_MS} ms)
		when event store client raises error`, async () => {
            spyOn(service, 'upsertProjections').mockImplementationOnce(() => {
                throw Error();
            });
            spyOn(service, 'onModuleInit');
            jest.useFakeTimers();
            await service.onModuleInit();
            jest.advanceTimersByTime(errors_constant_1.RECONNECTION_TRY_DELAY_IN_MS);
            expect(service.upsertProjections).toHaveBeenCalled();
            jest.useRealTimers();
        });
        it('should run the connection hook when connection raises an error while reading stream', async () => {
            spyOn(eventStoreConnectorMock, 'readStream').mockImplementationOnce(() => {
                throw Error();
            });
            await service.readFromStream('', {});
            expect(subsystemsMock.onConnectionFail).toHaveBeenCalled();
        });
        it('should run the connection hook when connection raises an error while reading metadatas', async () => {
            spyOn(eventStoreConnectorMock, 'getStreamMetadata').mockImplementationOnce(() => {
                throw Error();
            });
            await service.readMetadata('');
            expect(subsystemsMock.onConnectionFail).toHaveBeenCalled();
        });
        it('should run the connection hook when connection raises an error while deleting persistent subscription', async () => {
            spyOn(eventStoreConnectorMock, 'deletePersistentSubscription').mockImplementationOnce(() => {
                throw Error();
            });
            await service.deletePersistentSubscription('', '');
            expect(subsystemsMock.onConnectionFail).toHaveBeenCalled();
        });
    });
    describe('when writing events', () => {
        let nbEventBatchesStacked = 0;
        beforeEach(() => {
            spyOn(eventsStackerMock, 'getEventBatchesWaitingLineLength').mockImplementation(() => nbEventBatchesStacked);
            spyOn(eventsStackerMock, 'putEventsInWaitingLine').mockImplementation(() => nbEventBatchesStacked++);
            spyOn(eventsStackerMock, 'shiftEventsBatchFromWaitingLine').mockImplementation(() => {
                nbEventBatchesStacked--;
                return null;
            });
            spyOn(eventsStackerMock, 'getFirstOutFromEventsBatchesWaitingLine').mockReturnValue({
                stream: 'tutu',
                events: [],
                expectedVersion: { expectedRevision: db_client_1.ANY },
            });
            spyOn(eventStoreConnectorMock, 'appendToStream').mockResolvedValue(null);
        });
        it('should should put events batch in the waiting line when appending event', () => {
            service.writeEvents('testStream', [getDumbEvent()], {
                expectedRevision: db_client_1.ANY,
            });
            expect(eventsStackerMock.putEventsInWaitingLine).toHaveBeenCalled();
        });
        it('should try to write events batches from the stacker right after stacking a new event batch', () => {
            service.writeEvents('testStream', [getDumbEvent()], {
                expectedRevision: db_client_1.ANY,
            });
            expect(eventsStackerMock.getEventBatchesWaitingLineLength).toHaveBeenCalled();
            expect(eventsStackerMock.getFirstOutFromEventsBatchesWaitingLine).toHaveBeenCalled();
        });
        it('should try to append events to the store', async () => {
            spyOn(eventStoreConnectorMock, 'appendToStream');
            await service.writeEvents('testStream', [getDumbEvent()], {
                expectedRevision: db_client_1.ANY,
            });
            await service.writeEvents('testStream', [getDumbEvent()], {
                expectedRevision: db_client_1.ANY,
            });
            expect(eventStoreConnectorMock.appendToStream).toHaveBeenCalledTimes(2);
        });
        it('should shift batch only when appending is done properly', async () => {
            spyOn(eventStoreConnectorMock, 'appendToStream').mockImplementationOnce(() => {
                return null;
            });
            await service.writeEvents('testStream', [getDumbEvent()], {
                expectedRevision: db_client_1.ANY,
            });
            expect(eventsStackerMock.shiftEventsBatchFromWaitingLine).toHaveBeenCalled();
        });
        it('should not shift batch when error is raised', () => {
            let cpt = 2;
            spyOn(eventsStackerMock, 'getEventBatchesWaitingLineLength').mockImplementationOnce(() => {
                return cpt--;
            });
            spyOn(eventStoreConnectorMock, 'appendToStream').mockImplementationOnce(() => {
                throw Error();
            });
            service.writeEvents('testStream', [getDumbEvent()], {
                expectedRevision: db_client_1.ANY,
            });
            expect(eventsStackerMock.shiftEventsBatchFromWaitingLine).not.toHaveBeenCalled();
        });
        it('should return null as a result when appending fails', async () => {
            let cpt = 1;
            spyOn(eventsStackerMock, 'getEventBatchesWaitingLineLength').mockImplementationOnce(() => {
                return cpt--;
            });
            spyOn(eventStoreConnectorMock, 'appendToStream').mockImplementationOnce(() => {
                throw Error();
            });
            const result = await service.writeEvents('testStream', [getDumbEvent()], { expectedRevision: db_client_1.ANY });
            expect(result).toBeFalsy();
        });
        it('should return last appendResult when appending succeeded', async () => {
            const appendedResult1 = getDumbAppendResult(true);
            const appendedResult2 = getDumbAppendResult(false);
            spyOn(eventStoreConnectorMock, 'appendToStream').mockReturnValue(appendedResult1);
            await service.writeEvents('testStream', [getDumbEvent()], {
                expectedRevision: db_client_1.ANY,
            });
            spyOn(eventStoreConnectorMock, 'appendToStream').mockReturnValue(appendedResult2);
            const result = await service.writeEvents('testStream', [getDumbEvent()], { expectedRevision: db_client_1.ANY });
            expect(result.success).toEqual(false);
        });
        it('should return null as a result when unstacking events', async () => {
            const appendedResult1 = getDumbAppendResult(true);
            const appendedResult2 = getDumbAppendResult(false);
            nbEventBatchesStacked = 10;
            spyOn(eventsStackerMock, 'getEventBatchesWaitingLineLength').mockReturnValue(2);
            spyOn(eventStoreConnectorMock, 'appendToStream').mockReturnValue(appendedResult1);
            service
                .writeEvents('testStream', [getDumbEvent()], {
                expectedRevision: db_client_1.ANY,
            })
                .then(() => { });
            spyOn(eventStoreConnectorMock, 'appendToStream').mockReturnValue(appendedResult2);
            const result = await service.writeEvents('testStream', [getDumbEvent()], { expectedRevision: db_client_1.ANY });
            expect(result).toBeNull();
        });
        it('should run the connection hook when connection raises an error while appending an event', async () => {
            spyOn(eventStoreConnectorMock, 'appendToStream').mockImplementationOnce(() => {
                throw Error();
            });
            await service.writeEvents('test', []);
            expect(subsystemsMock.onConnectionFail).toHaveBeenCalled();
        });
    });
    describe('when writing metadatas', () => {
        let nbMetadatasStacked = 0;
        beforeEach(() => {
            jest.resetAllMocks();
            spyOn(eventsStackerMock, 'getMetadatasWaitingLineLength').mockImplementation(() => nbMetadatasStacked);
            spyOn(eventsStackerMock, 'putMetadatasInWaitingLine').mockImplementation(() => nbMetadatasStacked++);
            spyOn(eventsStackerMock, 'shiftMetadatasFromWaitingLine').mockImplementation(() => {
                nbMetadatasStacked--;
                return null;
            });
            spyOn(eventsStackerMock, 'getFirstOutFromMetadatasWaitingLine').mockReturnValue({
                streamName: 'tutu',
                metadata: null,
            });
            spyOn(eventStoreConnectorMock, 'setStreamMetadata').mockResolvedValue(null);
        });
        it('should stack metadatas by default', async () => {
            const metadata = getDumbMetadatas('abc');
            spyOn(eventsStackerMock, 'putMetadatasInWaitingLine');
            await service.writeMetadata(metadata.streamName, metadata.metadata);
            expect(eventsStackerMock.putMetadatasInWaitingLine).toHaveBeenCalled();
        });
        it('should try to write metadatas when not already trying to write in event store', async () => {
            const metadata = getDumbMetadatas('abc');
            await service.writeMetadata(metadata.streamName, metadata.metadata);
            expect(eventsStackerMock.getMetadatasWaitingLineLength).toHaveBeenCalled();
        });
        it('should call setStreamMetadata when writing metadata', async () => {
            const metadata = getDumbMetadatas('abc');
            await service.writeMetadata(metadata.streamName, metadata.metadata);
            expect(eventStoreConnectorMock.setStreamMetadata).toHaveBeenCalled();
        });
        it('should shift batch only when appending is done properly', async () => {
            const metadata = getDumbMetadatas('abc');
            await service.writeMetadata(metadata.streamName, metadata.metadata);
            expect(eventsStackerMock.shiftMetadatasFromWaitingLine).toHaveBeenCalled();
        });
        it('should shift batch only when appending is done properly', async () => {
            spyOn(eventStoreConnectorMock, 'setStreamMetadata').mockImplementationOnce(() => {
                throw Error();
            });
            const metadata = getDumbMetadatas('abc');
            await service.writeMetadata(metadata.streamName, metadata.metadata);
            expect(eventsStackerMock.shiftMetadatasFromWaitingLine).not.toHaveBeenCalled();
        });
        it('should return null as a result when appending fails', async () => {
            spyOn(eventStoreConnectorMock, 'setStreamMetadata').mockImplementationOnce(() => {
                throw Error();
            });
            const metadata = getDumbMetadatas('abc');
            const result = await service.writeMetadata(metadata.streamName, metadata.metadata);
            expect(result).toBeNull();
        });
        it('should return last appendResult when appending succeed', async () => {
            const metadata1 = getDumbMetadatas('abc');
            const metadata2 = getDumbMetadatas('tutu');
            await service.writeMetadata(metadata1.streamName, metadata1.metadata);
            spyOn(eventStoreConnectorMock, 'setStreamMetadata').mockResolvedValueOnce({ success: true });
            const result = await service.writeMetadata(metadata2.streamName, metadata2.metadata);
            expect(result).toBeTruthy();
        });
        it('should return last appendResult when appending succeed', async () => {
            nbMetadatasStacked = 10;
            const metadata = getDumbMetadatas('abc');
            const dumbAppendedResult = getDumbAppendResult(true);
            spyOn(eventStoreConnectorMock, 'setStreamMetadata').mockResolvedValue(dumbAppendedResult);
            service
                .writeMetadata(metadata.streamName, metadata.metadata)
                .then(() => { });
            const result = await service.writeMetadata(metadata.streamName, metadata.metadata);
            expect(result).toBeNull();
        });
        it('should exec error callback when appending is on error', async () => {
            spyOn(eventStoreConnectorMock, 'setStreamMetadata').mockImplementationOnce(() => {
                throw Error();
            });
            const metadata = getDumbMetadatas('abc');
            await service.writeMetadata(metadata.streamName, metadata.metadata);
            expect(subsystemsMock.onConnectionFail).toHaveBeenCalled();
        });
    });
});
const getDumbMetadatas = (streamName) => {
    return {
        streamName: streamName ?? '',
        metadata: null,
    };
};
const getDumbAppendResult = (success) => {
    return { success, nextExpectedRevision: 2n };
};
const getDumbEvent = (id) => {
    return {
        contentType: 'application/json',
        data: undefined,
        id: id ?? '',
        metadata: undefined,
        type: '',
    };
};
