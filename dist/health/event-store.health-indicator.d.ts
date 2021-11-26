import { EventStore } from '../event-store';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
export declare class EventStoreHealthIndicator extends HealthIndicator {
    private eventStore;
    constructor(eventStore: EventStore);
    check(): HealthIndicatorResult;
}
