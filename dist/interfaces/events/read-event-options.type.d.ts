import { IReadEvent } from './read-event.interface';
export declare type ReadEventOptionsType = Omit<IReadEvent, 'data' | 'getStream' | 'getStreamCategory' | 'getStreamId'>;
