import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
export declare class EventStoreObserverHealthIndicator extends HealthIndicator {
    check(): HealthIndicatorResult;
}
