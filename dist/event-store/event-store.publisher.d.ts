import { IEventPublisher } from '@nestjs/cqrs';
import { EventStore } from './event-store';
import { IWriteEvent, IWriteEventBusConfig, PublicationContextInterface } from '../interfaces';
export declare class EventStorePublisher<EventBase extends IWriteEvent = IWriteEvent> implements IEventPublisher<EventBase> {
    private readonly eventStore;
    private readonly config;
    private logger;
    private readonly onPublishFail;
    constructor(eventStore: EventStore, config: IWriteEventBusConfig);
    private writeEvents;
    protected getStreamName(correlationId: EventBase['metadata']['correlation_id']): string;
    publish<T extends EventBase>(event: T, context?: PublicationContextInterface): any;
    publishAll<T extends EventBase>(events: T[], context?: PublicationContextInterface): any;
}
