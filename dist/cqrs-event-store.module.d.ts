import { CqrsModule } from '@nestjs/cqrs';
import { DynamicModule } from '@nestjs/common';
import { EventStoreModule } from './event-store.module';
import { EventBusConfigType, IEventStoreModuleAsyncConfig, IEventStoreConfig, IEventStoreServiceConfig, ReadEventBusConfigType, IWriteEventBusConfig } from './interfaces';
import { EventStoreService } from './event-store';
declare type EventStoreModuleConfig = IEventStoreModuleAsyncConfig | IEventStoreConfig;
export declare class CqrsEventStoreModule extends CqrsModule {
    static registerSubscriptions(eventStoreConfig: EventStoreModuleConfig, subscriptions: IEventStoreServiceConfig['subscriptions'], eventBusConfig: ReadEventBusConfigType): DynamicModule;
    static registerProjections(eventStoreConfig: EventStoreModuleConfig, projections: IEventStoreServiceConfig['projections']): {
        module: typeof CqrsEventStoreModule;
        imports: (DynamicModule | {
            providers: (typeof import("./health").EventStoreHealthIndicator | typeof import("./health").EventStoreSubscriptionHealthIndicator | {
                provide: typeof import("./event-store").EventStore;
                useValue: import("./event-store").EventStore;
            })[];
            exports: (typeof import("./event-store").EventStore | typeof import("./health").EventStoreHealthIndicator | typeof import("./health").EventStoreSubscriptionHealthIndicator)[];
            module: typeof EventStoreModule;
        })[];
        provides: (typeof EventStoreService | {
            provide: symbol;
            useValue: IEventStoreServiceConfig;
        })[];
        exports: (typeof EventStoreModule)[];
    };
    static registerWriteBus(eventStoreConfig: EventStoreModuleConfig, eventBusConfig?: IWriteEventBusConfig): DynamicModule;
    static registerReadBus(eventStoreConfig: EventStoreModuleConfig, eventBusConfig: ReadEventBusConfigType, subscriptions?: IEventStoreServiceConfig['subscriptions']): DynamicModule;
    static register(eventStoreConfig: EventStoreModuleConfig, eventStoreServiceConfig?: IEventStoreServiceConfig, eventBusConfig?: EventBusConfigType): DynamicModule;
}
export {};
