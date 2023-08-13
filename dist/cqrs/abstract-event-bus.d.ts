import { Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { CommandBus, EventBus, UnhandledExceptionBus } from '@nestjs/cqrs';
export declare class AbstractEventBus<EventBase> extends EventBus<EventBase> {
    protected logger: Logger;
    constructor(commandBus: CommandBus, moduleRef: ModuleRef, unhandledExceptionBus: UnhandledExceptionBus);
}
