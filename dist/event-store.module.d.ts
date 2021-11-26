import { DynamicModule } from '@nestjs/common';
import { EventStore } from './event-store';
import { IEventStoreModuleAsyncConfig, IEventStoreConfig } from './interfaces';
import { EventStoreHealthIndicator, EventStoreSubscriptionHealthIndicator } from './health';
export declare class EventStoreModule {
    static register(config: IEventStoreConfig): {
        providers: (typeof EventStoreHealthIndicator | typeof EventStoreSubscriptionHealthIndicator | {
            provide: typeof EventStore;
            useValue: EventStore;
        })[];
        exports: (typeof EventStore | typeof EventStoreHealthIndicator | typeof EventStoreSubscriptionHealthIndicator)[];
        module: typeof EventStoreModule;
    };
    static registerAsync(options: IEventStoreModuleAsyncConfig): DynamicModule;
}
