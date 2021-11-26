import { CommandBus, EventBus as Parent } from '@nestjs/cqrs';
import { EventStore } from '../event-store';
import { IWriteEvent, IWriteEventBusConfig, PublicationContextInterface } from '../interfaces';
import { ModuleRef } from '@nestjs/core';
import { EventBusPrepublishService } from './event-bus-prepublish.service';
export declare class WriteEventBus<EventBase extends IWriteEvent = IWriteEvent> extends Parent<EventBase> {
    private readonly eventstore;
    private readonly config;
    private readonly prepublish;
    private logger;
    constructor(eventstore: EventStore, config: IWriteEventBusConfig, prepublish: EventBusPrepublishService, commandBus: CommandBus, moduleRef: ModuleRef);
    publish<T extends EventBase = EventBase>(event: T, context?: PublicationContextInterface): Promise<any>;
    publishAll<T extends EventBase = EventBase>(events: T[], context?: PublicationContextInterface): Promise<any>;
}
