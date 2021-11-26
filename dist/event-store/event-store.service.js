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
exports.EventStoreService = void 0;
const node_eventstore_client_1 = require("node-eventstore-client");
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const event_store_1 = require("./event-store");
const cqrs_1 = require("../cqrs");
const constants_1 = require("../constants");
let EventStoreService = class EventStoreService {
    constructor(eventStore, config, eventBus) {
        this.eventStore = eventStore;
        this.config = config;
        this.eventBus = eventBus;
        this.logger = new common_1.Logger(this.constructor.name);
    }
    async onModuleInit() {
        return await this.connect();
    }
    async connect() {
        await this.eventStore.connect();
        this.logger.debug(`EventStore connected`);
        await this.assertProjections(this.config.projections || []);
        if (this.config.subscriptions) {
            await this.subscribeToCatchUpSubscriptions(this.config.subscriptions.catchup || []);
            await this.subscribeToVolatileSubscriptions(this.config.subscriptions.volatile || []);
            await this.subscribeToPersistentSubscriptions(this.config.subscriptions.persistent || []);
        }
        return Promise.resolve(this);
    }
    onModuleDestroy() {
        this.logger.log(`Destroy, disconnect EventStore`);
        this.eventStore.close();
    }
    async assertProjections(projections) {
        await Promise.all(projections.map(async (projection) => {
            let content;
            if (projection.content) {
                this.logger.log(`Assert projection "${projection.name}" from content`);
                content = projection.content;
            }
            else if (projection.file) {
                this.logger.log(`Assert projection "${projection.name}" from file ${projection.file}`);
                content = (0, fs_1.readFileSync)(projection.file, 'utf8');
            }
            await this.eventStore.HTTPClient.projections.assert(projection.name, content, projection.mode, projection.enabled, projection.checkPointsEnabled, projection.emitEnabled, projection.trackEmittedStreams);
            this.logger.log(`Projection "${projection.name}" asserted !`);
        }));
    }
    async subscribeToCatchUpSubscriptions(subscriptions) {
        await Promise.all(subscriptions.map((config) => {
            return this.eventStore.subscribeToCatchupSubscription(config.stream, (subscription, payload) => this.onEvent(subscription, payload), config.lastCheckpoint, config.resolveLinkTos, config.onSubscriptionStart, config.onSubscriptionDropped);
        }));
    }
    async subscribeToVolatileSubscriptions(subscriptions) {
        await Promise.all(subscriptions.map((config) => {
            return this.eventStore.subscribeToVolatileSubscription(config.stream, (subscription, payload) => this.onEvent(subscription, payload), config.resolveLinkTos, config.onSubscriptionStart, config.onSubscriptionDropped);
        }));
    }
    async subscribeToPersistentSubscriptions(subscriptions) {
        await Promise.all(subscriptions.map(async (subscription) => {
            try {
                this.logger.log(`Check if persistent subscription "${subscription.group}" on stream ${subscription.stream} needs to be created `);
                if (subscription.options.resolveLinktos !== undefined) {
                    this.logger.warn("DEPRECATED: The resolveLinktos parameter shouln't be used anymore. The resolveLinkTos parameter should be used instead.");
                }
                await this.eventStore.HTTPClient.persistentSubscriptions.getSubscriptionInfo(subscription.group, subscription.stream);
            }
            catch (e) {
                if (!e.response || e.response.status != 404) {
                    throw e;
                }
                const options = {
                    ...subscription.options,
                    ...{
                        resolveLinkTos: subscription.options.resolveLinkTos ||
                            subscription.options.resolveLinktos,
                    },
                };
                await this.eventStore.HTTPClient.persistentSubscriptions.assert(subscription.group, subscription.stream, options);
                this.logger.log(`Persistent subscription "${subscription.group}" on stream ${subscription.stream} created ! ` +
                    JSON.stringify(subscription.options));
            }
        }));
        await Promise.all(subscriptions.map(async (config) => {
            this.logger.log(`Connecting to persistent subscription "${config.group}" on stream ${config.stream}`);
            return await this.eventStore.subscribeToPersistentSubscription(config.stream, config.group, (subscription, payload) => this.onEvent(subscription, payload), config.autoAck, config.bufferSize, config.onSubscriptionStart, config.onSubscriptionDropped);
        }));
    }
    async onEvent(subscription, payload) {
        if (this.config.onEvent) {
            return await this.onEvent(subscription, payload);
        }
        if (!this.eventBus) {
            return;
        }
        const { event } = payload;
        if (!payload.isResolved) {
            this.logger.warn(`Ignore unresolved event from stream ${payload.originalStreamId}[${event.eventNumber.low}] with ID ${payload.originalEvent.eventId}`);
            if (!subscription._autoAck && subscription.hasOwnProperty('_autoAck')) {
                await subscription.acknowledge([payload]);
            }
            return;
        }
        if (!event.isJson) {
            this.logger.warn(`Received event that could not be resolved! stream ${event.eventStreamId} type ${event.eventType} id ${event.eventId} `);
            if (!subscription._autoAck && subscription.hasOwnProperty('_autoAck')) {
                await subscription.acknowledge([payload]);
            }
            return;
        }
        let data = {};
        try {
            data = JSON.parse(event.data.toString());
        }
        catch (e) {
            this.logger.warn(`Received event of type ${event.eventType} with shitty data acknowledge`);
            if (!subscription._autoAck && subscription.hasOwnProperty('_autoAck')) {
                await subscription.acknowledge([payload]);
            }
            return;
        }
        let metadata = {};
        if (event.metadata.toString()) {
            metadata = { ...metadata, ...JSON.parse(event.metadata.toString()) };
        }
        const finalEvent = this.eventBus.map(data, {
            metadata,
            eventStreamId: event.eventStreamId,
            eventId: event.eventId,
            eventNumber: event.eventNumber.low,
            eventType: event.eventType,
            originalEventId: payload.originalEvent.eventId || event.eventId,
        });
        if (!finalEvent) {
            this.logger.warn(`Received event of type ${event.eventType} with no declared handler acknowledge`);
            if (!subscription._autoAck && subscription.hasOwnProperty('_autoAck')) {
                await subscription.acknowledge([payload]);
            }
            return;
        }
        if (subscription.hasOwnProperty('_autoAck')) {
            if (typeof finalEvent.ack == 'function' &&
                typeof finalEvent.nack == 'function') {
                const ack = async () => {
                    this.logger.debug(`Acknowledge event ${event.eventType} with id ${event.eventId}`);
                    return subscription.acknowledge([payload]);
                };
                const nack = async (action, reason) => {
                    this.logger.debug(`Nak and ${Object.keys(node_eventstore_client_1.PersistentSubscriptionNakEventAction)[action]} for event ${event.eventType} with id ${event.eventId} : reason ${reason}`);
                    return subscription.fail([payload], action, reason);
                };
                finalEvent.ack = ack;
                finalEvent.nack = nack;
            }
            else {
                this.logger.debug(`Auto acknowledge event ${event.eventType} with id ${event.eventId}`);
                subscription.acknowledge([payload]);
            }
        }
        await this.eventBus.publish(finalEvent);
    }
};
EventStoreService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(constants_1.EVENT_STORE_SERVICE_CONFIG)),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [event_store_1.EventStore, Object, cqrs_1.ReadEventBus])
], EventStoreService);
exports.EventStoreService = EventStoreService;
