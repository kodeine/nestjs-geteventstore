import { ReadEventOptionsType, IReadEvent } from '../events';
import { IEventBusPrepublishConfig } from './event-bus-prepublish-config.interface';
declare type EventMapperType = (data: any, options: ReadEventOptionsType) => IReadEvent | null;
declare type EventConstructorType<T extends IReadEvent = IReadEvent> = new (...args: any[]) => T;
export declare type ReadEventBusConfigType<T extends IReadEvent = IReadEvent> = IEventBusPrepublishConfig<T> & ({
    eventMapper: EventMapperType;
    allowedEvents?: never;
} | {
    eventMapper?: never;
    allowedEvents: {
        [key: string]: EventConstructorType;
    };
});
export {};
