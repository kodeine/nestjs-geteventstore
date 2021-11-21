import { EventMetadataDto } from './event-metadata.dto';
export declare class WriteEventDto {
    eventId: string;
    eventType: string;
    metadata: Partial<EventMetadataDto>;
    data: any;
}
