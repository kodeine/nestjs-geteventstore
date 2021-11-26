import { AggregateRoot as Parent } from '../cqrs';
import { ExpectedVersion } from '../enum';
import { IBaseEvent } from '../interfaces';
export declare abstract class EventStoreAggregateRoot<EventBase extends IBaseEvent = IBaseEvent> extends Parent<EventBase> {
    private _streamName?;
    private _streamMetadata?;
    set streamName(streamName: string);
    set streamMetadata(streamMetadata: any);
    set maxAge(maxAge: any);
    set maxCount(maxCount: any);
    commit(expectedVersion?: ExpectedVersion, expectedMetadataVersion?: ExpectedVersion): Promise<this>;
}
