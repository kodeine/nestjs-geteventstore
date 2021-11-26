import { EventBusConfigType, IEventStoreConfig, IEventStoreModuleAsyncConfig, IEventStoreServiceConfig } from '../interfaces';
declare type OptionsConfig = IEventStoreServiceConfig & EventBusConfigType;
export declare class EventStoreCqrsModule {
    static register(config: IEventStoreConfig, options: OptionsConfig): void;
    static registerAsync(config: IEventStoreModuleAsyncConfig, options: OptionsConfig): void;
}
export {};
