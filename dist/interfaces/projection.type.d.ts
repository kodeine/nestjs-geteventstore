import { ProjectionMode } from 'geteventstore-promise';
export declare type EventStoreProjectionType = {
    name: string;
    content?: string;
    file?: string;
    mode?: ProjectionMode;
    trackEmittedStreams?: boolean;
    enabled?: boolean;
    checkPointsEnabled?: boolean;
    emitEnabled?: boolean;
};
