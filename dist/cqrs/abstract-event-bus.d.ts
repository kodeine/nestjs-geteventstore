import { Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { CommandBus, EventBus, IEventHandler, ISaga, UnhandledExceptionBus } from '@nestjs/cqrs';
export declare class AbstractEventBus<EventBase> extends EventBus<EventBase> {
    protected logger: Logger;
    protected exceptionBus: UnhandledExceptionBus;
    protected cmdBus: CommandBus;
    constructor(commandBus: CommandBus, moduleRef: ModuleRef, unhandledExceptionBus: UnhandledExceptionBus);
    protected bind(handler: IEventHandler<EventBase>, id: string): void;
    protected registerSaga(saga: ISaga<EventBase>): void;
}
