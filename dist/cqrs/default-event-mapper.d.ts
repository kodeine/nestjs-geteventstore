import { ReadEventOptionsType, ReadEventBusConfigType } from '../interfaces';
export declare const defaultEventMapper: (allEvents: ReadEventBusConfigType['allowedEvents']) => (data: any, options: ReadEventOptionsType) => import("../interfaces").IReadEvent;
