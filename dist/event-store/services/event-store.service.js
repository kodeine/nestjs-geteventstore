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
var EventStoreService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventStoreService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const cqrs_1 = require("../../cqrs");
const constants_1 = require("../../constants");
const constants = require("@eventstore/db-client/dist/constants");
const db_client_1 = require("@eventstore/db-client");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const Client_1 = require("@eventstore/db-client/dist/Client");
const event_store_constants_1 = require("./event-store.constants");
const errors_constant_1 = require("./errors.constant");
const event_handler_helper_1 = require("./event.handler.helper");
const events_and_metadatas_stacker_1 = require("../reliability/interface/events-and-metadatas-stacker");
const health_1 = require("../health");
let EventStoreService = EventStoreService_1 = class EventStoreService {
    constructor(eventStore, subsystems, eventsStacker, eventStoreHealthIndicator, eventBus) {
        this.eventStore = eventStore;
        this.subsystems = subsystems;
        this.eventsStacker = eventsStacker;
        this.eventStoreHealthIndicator = eventStoreHealthIndicator;
        this.eventBus = eventBus;
        this.logger = new common_1.Logger(this.constructor.name);
        this.isOnError = false;
        this.isTryingToConnect = true;
        this.isTryingToWriteEvents = false;
        this.isTryingToWriteMetadatas = false;
    }
    async onModuleInit() {
        return await this.connect();
    }
    async connect() {
        try {
            if (this.subsystems.subscriptions)
                this.persistentSubscriptions =
                    await this.subscribeToPersistentSubscriptions(this.subsystems.subscriptions.persistent);
            if (this.subsystems.projections)
                this.upsertProjections(this.subsystems.projections).then(() => { });
            this.isOnError = false;
            this.isTryingToConnect = false;
            this.logger.log(`EventStore connected`);
            this.eventStoreHealthIndicator.updateStatus({
                connection: 'up',
                subscriptions: 'up',
            });
            await this.tryToWriteStackedEventBatches();
            await this.tryToWriteStackedMetadatas();
        }
        catch (e) {
            this.isTryingToConnect = true;
            this.eventStoreHealthIndicator.updateStatus({
                connection: 'down',
                subscriptions: 'down',
            });
            await this.retryToConnect();
        }
    }
    async retryToConnect() {
        this.logger.log(`EventStore connection failed : trying to reconnect`);
        setTimeout(async () => await this.connect(), errors_constant_1.RECONNECTION_TRY_DELAY_IN_MS);
    }
    async createProjection(query, type, projectionName, options) {
        switch (type) {
            case 'continuous':
                await this.eventStore.createContinuousProjection(projectionName, query, options ?? {});
                break;
            case 'transient':
                await this.eventStore.createTransientProjection(projectionName, query, options ?? {});
                break;
            case 'oneTime': {
                await this.eventStore.createOneTimeProjection(query, options ?? {});
                break;
            }
            default:
                return;
        }
    }
    getProjectionState(streamName, options) {
        return this.eventStore.getProjectionState(streamName, options);
    }
    async updateProjection(projection, content) {
        await this.eventStore.updateProjection(projection.name, content, {
            trackEmittedStreams: projection.trackEmittedStreams,
        });
    }
    extractProjectionContent(projection) {
        let content;
        if (projection.content) {
            this.logger.log(`"${projection.name}" projection in content`);
            content = projection.content;
        }
        else if (projection.file) {
            this.logger.log(`"${projection.name}" projection in file`);
            content = (0, fs_1.readFileSync)(projection.file, 'utf8');
        }
        return content;
    }
    async upsertProjections(projections) {
        for (const projection of projections) {
            this.logger.log(`Upserting projection "${projection.name}"...`);
            const content = this.extractProjectionContent(projection);
            await this.upsertProjection(content, projection);
            this.logger.log(`Projection "${projection.name}" upserted !`);
        }
    }
    async upsertProjection(content, projection) {
        await this.createProjection(content ?? projection.content, projection.mode, projection.name, {
            trackEmittedStreams: projection.trackEmittedStreams,
        }).catch(async (e) => {
            if (EventStoreService_1.isNotAProjectionAlreadyExistsError(e)) {
                this.logger.error(e);
                throw Error(e);
            }
            await this.updateProjection(projection, content);
        });
    }
    async createPersistentSubscription(streamName, groupName, settings, options) {
        try {
            await this.eventStore.createPersistentSubscription(streamName, groupName, {
                ...(0, db_client_1.persistentSubscriptionSettingsFromDefaults)(),
                ...settings,
            }, options);
        }
        catch (e) {
            this.logger.error(e);
        }
    }
    async updatePersistentSubscription(streamName, group, options, credentials) {
        try {
            await this.eventStore.updatePersistentSubscription(streamName, group, {
                ...(0, db_client_1.persistentSubscriptionSettingsFromDefaults)(),
                ...options,
            }, { credentials });
        }
        catch (e) {
            this.logger.error(e);
        }
    }
    async deletePersistentSubscription(streamName, groupName, options) {
        try {
            await this.eventStore.deletePersistentSubscription(streamName, groupName, options);
        }
        catch (e) {
            this.logger.error(`Error while deleting persistent subscription`);
            this.subsystems.onConnectionFail(e);
        }
    }
    async subscribeToPersistentSubscriptions(subscriptions = []) {
        await this.upsertPersistentSubscriptions(subscriptions);
        return Promise.all(subscriptions.map((config) => {
            this.logger.log(`Connecting to persistent subscription "${config.group}" on stream "${config.stream}"...`);
            const onEvent = (subscription, payload) => {
                return this.subsystems.onEvent
                    ? this.subsystems.onEvent(subscription, payload)
                    : this.onEvent(subscription, payload);
            };
            const persistentSubscription = this.eventStore.connectToPersistentSubscription(config.stream, config.group);
            if (!(0, shared_utils_1.isNil)(onEvent)) {
                persistentSubscription.on('data', (subscription, payload) => {
                    onEvent(subscription, payload);
                });
            }
            if (!(0, shared_utils_1.isNil)(config.onSubscriptionStart)) {
                persistentSubscription.on('confirmation', config.onSubscriptionStart);
            }
            if (!(0, shared_utils_1.isNil)(config.onSubscriptionDropped)) {
                persistentSubscription.on('close', config.onSubscriptionDropped);
            }
            persistentSubscription.on('error', config.onError);
            persistentSubscription.on('error', async () => {
                this.eventStoreHealthIndicator.updateStatus({
                    subscriptions: 'down',
                });
                if (!this.isTryingToConnect)
                    await this.connect();
            });
            this.logger.log(`Connected to persistent subscription "${config.group}" on stream "${config.stream}" !`);
            return persistentSubscription;
        }));
    }
    async upsertPersistentSubscriptions(subscriptions) {
        for (const subscription of subscriptions) {
            await this.upsertPersistentSubscription(subscription);
        }
    }
    async upsertPersistentSubscription(subscription) {
        try {
            await this.eventStore.createPersistentSubscription(subscription.stream, subscription.group, {
                ...(0, db_client_1.persistentSubscriptionSettingsFromDefaults)(),
                ...subscription.settingsForCreation?.subscriptionSettings,
            }, subscription.settingsForCreation?.baseOptions);
            this.logger.log(`Persistent subscription "${subscription.group}" on stream ${subscription.stream} created.`);
        }
        catch (e) {
            if (EventStoreService_1.isNotAlreadyExistsError(e)) {
                this.logger.error('Subscription creation try : ', e);
                throw new Error(e);
            }
            await this.eventStore.updatePersistentSubscription(subscription.stream, subscription.group, {
                ...(0, db_client_1.persistentSubscriptionSettingsFromDefaults)(),
                ...subscription.settingsForCreation.subscriptionSettings,
            }, subscription.settingsForCreation.baseOptions);
        }
    }
    static isNotAlreadyExistsError(e) {
        return e.code !== errors_constant_1.PERSISTENT_SUBSCRIPTION_ALREADY_EXIST_ERROR_CODE;
    }
    static isNotAProjectionAlreadyExistsError(e) {
        return e.code !== errors_constant_1.PROJECTION_ALREADY_EXIST_ERROR_CODE;
    }
    getPersistentSubscriptions() {
        return this.persistentSubscriptions;
    }
    readMetadata(stream) {
        try {
            return this.eventStore.getStreamMetadata(stream);
        }
        catch (e) {
            this.logger.error(`Error while reading metadatas of stream ${stream}`);
            this.subsystems.onConnectionFail(e);
        }
    }
    async writeMetadata(streamName, metadata, options) {
        this.eventsStacker.putMetadatasInWaitingLine({
            streamName,
            metadata,
            options,
        });
        return this.isTryingToWriteMetadatas
            ? null
            : await this.tryToWriteStackedMetadatas();
    }
    async tryToWriteStackedMetadatas() {
        try {
            this.isTryingToWriteMetadatas = true;
            let lastValidAppendResult = null;
            while (this.eventsStacker.getMetadatasWaitingLineLength() > 0) {
                const metadata = this.eventsStacker.getFirstOutFromMetadatasWaitingLine();
                lastValidAppendResult = await this.eventStore.setStreamMetadata(metadata.streamName, metadata.metadata, metadata.options);
                this.eventsStacker.shiftMetadatasFromWaitingLine();
            }
            this.isTryingToWriteMetadatas = false;
            return lastValidAppendResult;
        }
        catch (e) {
            this.eventStoreHealthIndicator.updateStatus({ connection: 'down' });
            this.subsystems.onConnectionFail(e);
            return null;
        }
    }
    async readFromStream(stream, options, readableOptions) {
        try {
            return this.eventStore.readStream(stream, options, readableOptions);
        }
        catch (e) {
            this.logger.error(`Error while reading a stream`);
            this.subsystems.onConnectionFail(e);
        }
    }
    async writeEvents(stream, events, expectedVersion = {
        expectedRevision: constants.ANY,
    }) {
        this.eventsStacker.putEventsInWaitingLine({
            events,
            stream,
            expectedVersion,
        });
        return this.isTryingToWriteEvents
            ? null
            : await this.tryToWriteStackedEventBatches();
    }
    async tryToWriteStackedEventBatches() {
        try {
            let lastValidAppendResult = null;
            this.isTryingToWriteEvents = true;
            while (this.eventsStacker.getEventBatchesWaitingLineLength() > 0) {
                lastValidAppendResult = await this.tryToWriteEventsFromBatch();
            }
            this.isTryingToWriteEvents = false;
            return lastValidAppendResult;
        }
        catch (e) {
            this.eventStoreHealthIndicator.updateStatus({ connection: 'down' });
            this.subsystems.onConnectionFail(e);
            return null;
        }
    }
    async tryToWriteEventsFromBatch() {
        const batch = this.eventsStacker.getFirstOutFromEventsBatchesWaitingLine();
        const appendResult = await this.eventStore.appendToStream(batch.stream, batch.events, batch.expectedVersion);
        this.eventsStacker.shiftEventsBatchFromWaitingLine();
        return appendResult;
    }
    async onEvent(subscription, payload) {
        return event_handler_helper_1.default.onEvent(this.logger, subscription, payload, this.eventBus);
    }
};
EventStoreService = EventStoreService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(event_store_constants_1.EVENT_STORE_CONNECTOR)),
    __param(1, (0, common_1.Inject)(constants_1.EVENT_STORE_SUBSYSTEMS)),
    __param(2, (0, common_1.Inject)(events_and_metadatas_stacker_1.EVENTS_AND_METADATAS_STACKER)),
    __param(4, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [Client_1.Client, Object, Object, health_1.EventStoreHealthIndicator,
        cqrs_1.ReadEventBus])
], EventStoreService);
exports.EventStoreService = EventStoreService;
