import { DynamicModule } from '@nestjs/common';
import { IEventStoreSubsystems } from './config';
import { EventStoreConnectionConfig } from './config/event-store-connection-config';
export declare class EventStoreModule {
    static register(config: EventStoreConnectionConfig, eventStoreSubsystems?: IEventStoreSubsystems): Promise<DynamicModule>;
    private static getEventStoreConnector;
}
