import { IWriteEvent } from './write-event.interface';
import { ReadEventOptionsType } from './read-event-options.type';
declare type WriteEventOptionsType = Omit<IWriteEvent, 'data'> & {
    eventStreamId?: never;
    eventNumber?: never;
    originalEventId?: never;
};
export declare type EventOptionsType = ReadEventOptionsType | WriteEventOptionsType;
export {};
