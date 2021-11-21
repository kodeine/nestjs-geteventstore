import { EventStoreEvent } from './index';
import { IAcknowledgeableEvent } from '../../interfaces';
import { PersistentSubscriptionNakEventAction } from '../../interfaces/events/persistent-subscription-nak-event-action.enum';
export declare abstract class EventStoreAcknowledgeableEvent extends EventStoreEvent implements IAcknowledgeableEvent {
    ack(): Promise<void>;
    nack(action: PersistentSubscriptionNakEventAction, reason: string): Promise<void>;
}
