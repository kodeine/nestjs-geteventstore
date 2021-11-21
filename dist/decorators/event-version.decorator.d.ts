import { IBaseEvent } from '../interfaces';
export declare const EventVersion: (version: number) => <T extends new (...args: any[]) => IBaseEvent>(BaseEvent: T) => {
    new (...args: any[]): {
        data: any;
        metadata?: Partial<import("..").EventMetadataDto>;
        eventId?: string;
        eventType?: string;
    };
} & T;
