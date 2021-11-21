import { IBaseEvent } from '../events';
export declare type EventBusPrepublishPrepareCallbackType<T extends IBaseEvent, K extends IBaseEvent = T> = (events: T[]) => Promise<K[]>;
