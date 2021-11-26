import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { EventStore } from '../event-store';
export declare class EventStoreSubscriptionHealthIndicator extends HealthIndicator {
    private eventStore;
    constructor(eventStore: EventStore);
    check(): HealthIndicatorResult;
}
