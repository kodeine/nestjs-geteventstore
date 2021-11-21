import { AggregateRoot as Parent } from '../cqrs';
import { IBaseEvent } from '../interfaces';
import { AppendExpectedRevision } from '@eventstore/db-client/dist/types';
import { StreamMetadata } from '@eventstore/db-client/dist/utils/streamMetadata';
export declare abstract class EventStoreAggregateRoot<EventBase extends IBaseEvent = IBaseEvent> extends Parent<EventBase> {
    private _streamName?;
    private _streamMetadata?;
    set streamName(streamName: string);
    set streamMetadata(streamMetadata: StreamMetadata);
    set maxAge(maxAge: number);
    set maxCount(maxCount: number);
    commit(expectedRevision?: AppendExpectedRevision, expectedMetadataRevision?: AppendExpectedRevision): Promise<this>;
}
