import { CqrsModule } from '@nestjs/cqrs';
import { DynamicModule } from '@nestjs/common';
import { EventBusConfigType, IPersistentSubscriptionConfig, IWriteEventBusConfig, ReadEventBusConfigType } from './interfaces';
import { IEventStoreSubsystems } from './event-store/config';
import { EventStoreConnectionConfig } from './event-store/config/event-store-connection-config';
export declare class CqrsEventStoreModule extends CqrsModule {
    static register(eventStoreConfig: EventStoreConnectionConfig, eventStoreSubsystems?: IEventStoreSubsystems, eventBusConfig?: EventBusConfigType): DynamicModule;
    static registerReadBus(eventStoreConfig: EventStoreConnectionConfig, eventBusConfig: ReadEventBusConfigType, subscriptions?: IPersistentSubscriptionConfig[]): DynamicModule;
    static registerWriteBus(eventStoreConfig: EventStoreConnectionConfig, eventBusConfig?: IWriteEventBusConfig): DynamicModule;
}
