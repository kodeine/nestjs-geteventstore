import { CommandBus, EventBus as Parent } from '@nestjs/cqrs';
import { IWriteEvent, IWriteEventBusConfig, PublicationContextInterface } from '../interfaces';
import { ModuleRef } from '@nestjs/core';
import { EventBusPrepublishService } from './event-bus-prepublish.service';
import { IEventStoreService } from '../event-store/services/event-store.service.interface';
export declare class WriteEventBus<EventBase extends IWriteEvent = IWriteEvent> extends Parent<EventBase> {
    private readonly eventstoreService;
    private readonly config;
    private readonly prepublish;
    private logger;
    constructor(eventstoreService: IEventStoreService, config: IWriteEventBusConfig, prepublish: EventBusPrepublishService, commandBus: CommandBus, moduleRef: ModuleRef);
    publish<T extends EventBase = EventBase>(event: T, context?: PublicationContextInterface): Promise<any>;
    publishAll<T extends EventBase = EventBase>(events: T[], context?: PublicationContextInterface): Promise<any>;
}
