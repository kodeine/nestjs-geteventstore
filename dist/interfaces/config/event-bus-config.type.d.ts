import { ReadEventBusConfigType } from './read-event-bus-config.type';
import { IWriteEventBusConfig } from './write-event-bus-config.interface';
export declare type EventBusConfigType = {
    read?: ReadEventBusConfigType;
    write?: IWriteEventBusConfig;
};
