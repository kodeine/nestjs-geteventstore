import EventBatch from './event-batch';
import MetadatasContextDatas from './metadatas-context-datas';
export declare const EVENTS_AND_METADATAS_STACKER: unique symbol;
export default interface IEventsAndMetadatasStacker {
    putEventsInWaitingLine(events: EventBatch): void;
    shiftEventsBatchFromWaitingLine(): EventBatch;
    getFirstOutFromEventsBatchesWaitingLine(): EventBatch;
    getEventBatchesWaitingLineLength(): number;
    putMetadatasInWaitingLine(metadata: MetadatasContextDatas): void;
    getFirstOutFromMetadatasWaitingLine(): MetadatasContextDatas;
    shiftMetadatasFromWaitingLine(): MetadatasContextDatas;
    getMetadatasWaitingLineLength(): number;
}
