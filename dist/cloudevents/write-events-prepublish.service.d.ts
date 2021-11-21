import { Context } from 'nestjs-context';
import { IBaseEvent, IEventBusPrepublishPrepareProvider, IEventBusPrepublishValidateProvider, IWriteEventBusConfig } from '../interfaces';
import { EventStoreEvent } from '../event-store/events';
export declare class WriteEventsPrepublishService<T extends IBaseEvent = EventStoreEvent> implements IEventBusPrepublishValidateProvider<T>, IEventBusPrepublishPrepareProvider<T> {
    private readonly context;
    private readonly config;
    private readonly logger;
    constructor(context: Context, config: IWriteEventBusConfig);
    onValidationFail(events: T[], errors: any[]): Promise<void>;
    validate(events: T[]): Promise<any[]>;
    private getCloudEventMetadata;
    prepare(events: T[]): Promise<any[]>;
}
