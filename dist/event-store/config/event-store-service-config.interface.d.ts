import { EventStoreProjection, IPersistentSubscriptionConfig } from '../../interfaces';
export interface IEventStoreSubsystems {
    projections?: EventStoreProjection[];
    subscriptions?: {
        persistent?: IPersistentSubscriptionConfig[];
    };
    onEvent?: (sub: any, payload: any) => void;
    onConnectionFail?: (err: Error) => void;
}
