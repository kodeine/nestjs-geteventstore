import { IEventPublisher } from '@nestjs/cqrs';
import { IWriteEvent, IWriteEventBusConfig, PublicationContextInterface } from '../../interfaces';
import { IEventStoreService } from '../services/event-store.service.interface';
import { AppendResult } from '@eventstore/db-client/dist/types';
export declare class EventStorePublisher<EventBase extends IWriteEvent = IWriteEvent> implements IEventPublisher<EventBase> {
    private readonly eventStoreService;
    private readonly config;
    private logger;
    constructor(eventStoreService: IEventStoreService, config: IWriteEventBusConfig);
    private writeEvents;
    protected getStreamName(correlationId: EventBase['metadata']['correlation_id']): string;
    publish<T extends EventBase>(event: T, context?: PublicationContextInterface): Promise<AppendResult>;
    publishAll<T extends EventBase>(events: T[], context?: PublicationContextInterface): Promise<AppendResult>;
}
