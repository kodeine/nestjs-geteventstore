import { EventOptionsType, IReadEvent, IWriteEvent } from '../interfaces';
import { WriteEventDto } from '../dto/write-event.dto';
export declare abstract class EventStoreEvent extends WriteEventDto implements IWriteEvent, IReadEvent {
    data: any;
    readonly eventStreamId: IReadEvent['eventStreamId'] | undefined;
    readonly eventNumber: IReadEvent['eventNumber'] | undefined;
    readonly originalEventId: IReadEvent['originalEventId'] | undefined;
    constructor(data: any, options?: EventOptionsType);
    getStream(): string;
    getStreamCategory(): string;
    getStreamId(): string;
}
