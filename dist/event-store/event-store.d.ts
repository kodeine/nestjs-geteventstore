import { EventStoreNodeConnection, EventStorePersistentSubscription } from 'node-eventstore-client';
import * as geteventstorePromise from 'geteventstore-promise';
import { HTTPClient } from 'geteventstore-promise';
import { IEventStoreConfig, IWriteEvent, ISubscriptionStatus } from '../interfaces';
import { ExpectedVersion } from '../enum';
export declare class EventStore {
    readonly config: IEventStoreConfig;
    private logger;
    connection: EventStoreNodeConnection;
    readonly HTTPClient: HTTPClient;
    isConnected: boolean;
    private catchupSubscriptions;
    private volatileSubscriptions;
    private persistentSubscriptions;
    constructor(config: IEventStoreConfig);
    connect(): Promise<void>;
    writeEvents(stream: any, events: IWriteEvent[], expectedVersion?: ExpectedVersion): import("rxjs").Observable<import("node-eventstore-client").WriteResult>;
    writeMetadata(stream: any, expectedStreamMetadataVersion: ExpectedVersion, streamMetadata: any): import("rxjs").Observable<import("node-eventstore-client").WriteResult>;
    close(): void;
    get subscriptions(): {
        persistent: ISubscriptionStatus;
        catchup: ISubscriptionStatus;
    };
    readEventsForward({ stream, first, count }: {
        stream: any;
        first?: number;
        count?: number;
    }): Promise<geteventstorePromise.HTTPReadResult>;
    subscribeToPersistentSubscription(stream: string, group: string, onEvent: (sub: any, payload: any) => void, autoAck?: boolean, bufferSize?: number, onSubscriptionStart?: (sub: any) => void, onSubscriptionDropped?: (sub: any, reason: any, error: any) => void): Promise<EventStorePersistentSubscription>;
    subscribeToVolatileSubscription(stream: string, onEvent: (sub: any, payload: any) => void, resolveLinkTos?: boolean, onSubscriptionStart?: (subscription: any) => void, onSubscriptionDropped?: (sub: any, reason: any, error: any) => void): Promise<import("node-eventstore-client").EventStoreSubscription>;
    subscribeToCatchupSubscription(stream: string, onEvent: (sub: any, payload: any) => void, lastCheckpoint?: number, resolveLinkTos?: boolean, onSubscriptionStart?: (subscription: any) => void, onSubscriptionDropped?: (sub: any, reason: any, error: any) => void): Promise<import("node-eventstore-client").EventStoreCatchUpSubscription>;
    getProjectionState(name: string, partition?: string): Promise<object>;
}
