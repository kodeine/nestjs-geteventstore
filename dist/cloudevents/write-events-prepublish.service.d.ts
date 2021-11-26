import { ValidationError } from 'class-validator';
import { Context } from 'nestjs-context';
import { IBaseEvent, IEventBusPrepublishPrepareProvider, IEventBusPrepublishValidateProvider } from '../interfaces';
import { EventStoreEvent } from '../events';
export declare class WriteEventsPrepublishService<T extends IBaseEvent = EventStoreEvent> implements IEventBusPrepublishValidateProvider<T>, IEventBusPrepublishPrepareProvider<T> {
    private readonly context;
    private readonly logger;
    constructor(context: Context);
    onValidationFail(events: T[], errors: ValidationError[]): Promise<void>;
    private getErrorDetails;
    private flattenDetails;
    validate(events: T[]): Promise<any[]>;
    private getCloudEventMetadata;
    prepare(events: T[]): Promise<any[]>;
}
