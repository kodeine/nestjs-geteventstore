import { ModuleRef } from '@nestjs/core';
import { IBaseEvent, IEventBusPrepublishConfig } from '../interfaces';
export declare class EventBusPrepublishService<EventBase extends IBaseEvent = IBaseEvent> {
    private readonly moduleRef;
    constructor(moduleRef: ModuleRef);
    private getProvider;
    validate<T extends EventBase = EventBase>(config: IEventBusPrepublishConfig<T>, events: T[]): Promise<Error[]>;
    prepare<T extends EventBase = EventBase>(config: IEventBusPrepublishConfig<T>, events: T[]): Promise<T[]>;
}
