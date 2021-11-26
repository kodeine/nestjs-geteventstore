import { IStreamMetadata } from './stream-metadata.interface';
import { ExpectedVersion } from '../../enum';
export interface IStreamConfig {
    streamName?: string;
    expectedVersion?: ExpectedVersion;
    metadata?: IStreamMetadata;
}
