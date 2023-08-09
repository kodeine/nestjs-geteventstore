import { CommandBus, EventBus as Parent, UnhandledExceptionBus } from '@nestjs/cqrs';
import { ReadEventOptionsType, IReadEvent, ReadEventBusConfigType } from '../interfaces';
import { ModuleRef } from '@nestjs/core';
import { EventBusPrepublishService } from './event-bus-prepublish.service';
export declare class ReadEventBus<EventBase extends IReadEvent = IReadEvent> extends Parent<EventBase> {
    private readonly config;
    private readonly prepublish;
    private logger;
    constructor(config: ReadEventBusConfigType<EventBase>, prepublish: EventBusPrepublishService<EventBase>, commandBus: CommandBus, moduleRef: ModuleRef, unhandledExceptionBus: UnhandledExceptionBus);
    publish<T extends EventBase = EventBase>(event: T): Promise<any>;
    publishAll<T extends EventBase = EventBase>(events: T[]): Promise<any>;
    map<T extends EventBase>(data: any, options: ReadEventOptionsType): T;
}
