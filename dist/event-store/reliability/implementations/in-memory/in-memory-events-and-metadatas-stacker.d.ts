import IEventsAndMetadatasStacker from '../../interface/events-and-metadatas-stacker';
import EventBatch from '../../interface/event-batch';
import MetadatasContextDatas from '../../interface/metadatas-context-datas';
export default class InMemoryEventsAndMetadatasStacker implements IEventsAndMetadatasStacker {
    private eventBatchesFifo;
    private metadatasFifo;
    shiftEventsBatchFromWaitingLine(): EventBatch;
    getFirstOutFromEventsBatchesWaitingLine(): EventBatch;
    putEventsInWaitingLine(batch: EventBatch): void;
    getEventBatchesWaitingLineLength(): number;
    shiftMetadatasFromWaitingLine(): MetadatasContextDatas;
    getFirstOutFromMetadatasWaitingLine(): MetadatasContextDatas;
    getMetadatasWaitingLineLength(): number;
    putMetadatasInWaitingLine(metadata: MetadatasContextDatas): void;
}
