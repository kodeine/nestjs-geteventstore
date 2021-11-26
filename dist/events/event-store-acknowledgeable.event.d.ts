import { PersistentSubscriptionNakEventAction } from 'node-eventstore-client';
import { EventStoreEvent } from './index';
import { IAcknowledgeableEvent } from '../interfaces';
export declare abstract class EventStoreAcknowledgeableEvent extends EventStoreEvent implements IAcknowledgeableEvent {
    ack(): Promise<void>;
    nack(action: PersistentSubscriptionNakEventAction, reason: string): Promise<void>;
}
