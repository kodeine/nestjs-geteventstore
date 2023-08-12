import { CommandBus, UnhandledExceptionBus } from '@nestjs/cqrs';
import { EventStore } from '../event-store';
import { IWriteEvent, IWriteEventBusConfig, PublicationContextInterface } from '../interfaces';
import { ModuleRef } from '@nestjs/core';
import { EventBusPrepublishService } from './event-bus-prepublish.service';
import { AbstractEventBus } from './abstract-event-bus';
export declare class WriteEventBus<EventBase extends IWriteEvent = IWriteEvent> extends AbstractEventBus<EventBase> {
    private readonly eventstore;
    private readonly config;
    private readonly prepublish;
    constructor(eventstore: EventStore, config: IWriteEventBusConfig, prepublish: EventBusPrepublishService, commandBus: CommandBus, moduleRef: ModuleRef, unhandledExceptionBus: UnhandledExceptionBus);
    publish<T extends EventBase = EventBase>(event: T, context?: PublicationContextInterface): Promise<any>;
    publishAll<T extends EventBase = EventBase>(events: T[], context?: PublicationContextInterface): Promise<any>;
}
