"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventStore = void 0;
const uuid_1 = require("uuid");
const common_1 = require("@nestjs/common");
const node_eventstore_client_1 = require("node-eventstore-client");
const geteventstorePromise = require("geteventstore-promise");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const enum_1 = require("../enum");
const create_event_default_metadata_1 = require("../tools/create-event-default-metadata");
class EventStore {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(this.constructor.name);
        this.isConnected = false;
        this.catchupSubscriptions = {};
        this.volatileSubscriptions = {};
        this.persistentSubscriptions = {};
        this.HTTPClient = new geteventstorePromise.HTTPClient({
            hostname: config.http.host.replace(/^https?:\/\//, ''),
            port: config.http.port,
            credentials: {
                username: config.credentials.username,
                password: config.credentials.password,
            },
        });
    }
    async connect() {
        this.connection = (0, node_eventstore_client_1.createConnection)({
            ...this.config.options,
            defaultUserCredentials: this.config.credentials,
        }, this.config.tcp || this.config.clusterDns, this.config.tcpConnectionName);
        this.logger.debug('Connecting to EventStore');
        await this.connection.connect();
        this.connection.on('connected', () => {
            this.logger.log('Connection to EventStore established!');
            this.isConnected = true;
            this.config.onTcpConnected(this);
        });
        this.connection.on('closed', () => {
            this.isConnected = false;
            this.logger.error('Connection to EventStore closed!');
            this.config.onTcpDisconnected(this);
        });
    }
    writeEvents(stream, events, expectedVersion = enum_1.ExpectedVersion.Any) {
        return (0, rxjs_1.from)(events)
            .pipe((0, operators_1.map)((event) => (0, node_eventstore_client_1.createJsonEventData)(event.eventId || (0, uuid_1.v4)(), event.data || {}, event.metadata
            ? { ...(0, create_event_default_metadata_1.createEventDefaultMetadata)(), ...event.metadata }
            : (0, create_event_default_metadata_1.createEventDefaultMetadata)(), event.eventType || event.constructor.name)), (0, operators_1.catchError)((err) => {
            return (0, rxjs_1.throwError)({
                message: `Unable to convert event to EventStore event : ${err.message}`,
                response: { status: 400 },
            });
        }), (0, operators_1.toArray)())
            .pipe((0, operators_1.flatMap)((events) => (0, rxjs_1.from)(this.connection.appendToStream(stream, expectedVersion, events))), (0, operators_1.catchError)((err) => {
            if (err.response) {
                err.message = err.message + ' : ' + err.response.statusText;
            }
            return (0, rxjs_1.throwError)({
                ...err,
                message: `Error appending ${events.length} events to stream ${stream} : ${err.message}`,
            });
        }));
    }
    writeMetadata(stream, expectedStreamMetadataVersion = enum_1.ExpectedVersion.Any, streamMetadata) {
        return (0, rxjs_1.from)(this.connection.setStreamMetadataRaw(stream, expectedStreamMetadataVersion, streamMetadata)).pipe((0, operators_1.catchError)((err) => {
            const message = err.message.err.response ? err.response.statusText : '';
            return (0, rxjs_1.throwError)({
                ...err,
                message: `Error appending metadata to stream ${stream} : ${message}`,
            });
        }));
    }
    close() {
        this.connection.close();
    }
    get subscriptions() {
        return {
            persistent: this.persistentSubscriptions,
            catchup: this.catchupSubscriptions,
        };
    }
    async readEventsForward({ stream, first = 0, count = 1000 }) {
        return await this.HTTPClient.readEventsForward(stream, first, count);
    }
    async subscribeToPersistentSubscription(stream, group, onEvent, autoAck = false, bufferSize = 10, onSubscriptionStart = undefined, onSubscriptionDropped = undefined) {
        try {
            return await this.connection
                .connectToPersistentSubscription(stream, group, onEvent, (subscription, reason, error) => {
                this.logger.warn(`Connected to persistent subscription ${group} on stream ${stream} dropped ${reason} : ${error}`);
                this.persistentSubscriptions[`${stream}-${group}`].isConnected = false;
                this.persistentSubscriptions[`${stream}-${group}`].status =
                    reason + ' ' + error;
                if (onSubscriptionDropped) {
                    onSubscriptionDropped(subscription, reason, error);
                }
            }, undefined, bufferSize, autoAck)
                .then((subscription) => {
                this.logger.log(`Connected to persistent subscription ${group} on stream ${stream}!`);
                this.persistentSubscriptions[`${stream}-${group}`] = {
                    isConnected: true,
                    streamName: stream,
                    group: group,
                    subscription: subscription,
                    status: `Connected to persistent subscription ${group} on stream ${stream}!`,
                };
                if (onSubscriptionStart) {
                    onSubscriptionStart(subscription);
                }
                return subscription;
            });
        }
        catch (err) {
            this.logger.error(err.message);
        }
    }
    async subscribeToVolatileSubscription(stream, onEvent, resolveLinkTos = true, onSubscriptionStart = undefined, onSubscriptionDropped = undefined) {
        this.logger.log(`Catching up and subscribing to stream ${stream}!`);
        try {
            const subscription = await this.connection.subscribeToStream(stream, resolveLinkTos, onEvent, (subscription, reason, error) => {
                this.catchupSubscriptions[stream].isConnected = false;
                if (onSubscriptionDropped) {
                    onSubscriptionDropped(subscription, reason, error);
                }
            });
            this.volatileSubscriptions[stream] = {
                isConnected: true,
                streamName: stream,
                subscription: subscription,
                status: `Connected volatile subscription on stream ${stream}!`,
            };
            return subscription;
        }
        catch (err) {
            this.logger.error(err.message);
        }
    }
    async subscribeToCatchupSubscription(stream, onEvent, lastCheckpoint = 0, resolveLinkTos = true, onSubscriptionStart = undefined, onSubscriptionDropped = undefined) {
        this.logger.log(`Catching up and subscribing to stream ${stream}!`);
        try {
            return await this.connection.subscribeToStreamFrom(stream, lastCheckpoint, resolveLinkTos, onEvent, (subscription) => {
                this.catchupSubscriptions[stream] = {
                    isConnected: true,
                    streamName: stream,
                    subscription: subscription,
                    status: `Connected catchup subscription on stream ${stream}!`,
                };
                if (onSubscriptionStart) {
                    onSubscriptionStart(subscription);
                }
            }, (subscription, reason, error) => {
                this.catchupSubscriptions[stream].isConnected = false;
                if (onSubscriptionDropped) {
                    onSubscriptionDropped(subscription, reason, error);
                }
            });
        }
        catch (err) {
            this.logger.error(err.message);
        }
    }
    async getProjectionState(name, partition) {
        return await this.HTTPClient.projections.getState(name, { partition });
    }
}
exports.EventStore = EventStore;
