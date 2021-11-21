import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import EventStoreHealthStatus from './event-store-health.status';
export declare class EventStoreHealthIndicator extends HealthIndicator {
    private esStatus;
    constructor();
    check(): HealthIndicatorResult;
    updateStatus(esHealthStatus: EventStoreHealthStatus): void;
}
