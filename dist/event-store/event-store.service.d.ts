import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EventStoreProjectionType } from '../interfaces';
import { EventStore } from './event-store';
import { ReadEventBus } from '../cqrs';
import { ICatchupSubscriptionConfig, IEventStoreServiceConfig, IPersistentSubscriptionConfig, IVolatileSubscriptionConfig } from '../interfaces';
export declare class EventStoreService implements OnModuleDestroy, OnModuleInit {
    private readonly eventStore;
    private readonly config;
    private readonly eventBus?;
    private logger;
    constructor(eventStore: EventStore, config: IEventStoreServiceConfig, eventBus?: ReadEventBus);
    onModuleInit(): Promise<this>;
    connect(): Promise<this>;
    onModuleDestroy(): any;
    assertProjections(projections: EventStoreProjectionType[]): Promise<void>;
    subscribeToCatchUpSubscriptions(subscriptions: ICatchupSubscriptionConfig[]): Promise<void>;
    subscribeToVolatileSubscriptions(subscriptions: IVolatileSubscriptionConfig[]): Promise<void>;
    subscribeToPersistentSubscriptions(subscriptions: IPersistentSubscriptionConfig[]): Promise<void>;
    onEvent(subscription: any, payload: any): Promise<void>;
}
