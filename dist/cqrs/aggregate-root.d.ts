import { Logger } from '@nestjs/common';
import { IEvent } from '@nestjs/cqrs';
declare const INTERNAL_EVENTS: unique symbol;
declare const IS_AUTO_COMMIT_ENABLED: unique symbol;
export declare abstract class AggregateRoot<EventBase extends IEvent = IEvent> {
    protected logger: Logger;
    [IS_AUTO_COMMIT_ENABLED]: boolean;
    private readonly [INTERNAL_EVENTS];
    private readonly _publishers;
    set autoCommit(value: boolean);
    get autoCommit(): boolean;
    addPublisher<T extends Function | object = Function>(publisher: T, method?: keyof T): this;
    get publishers(): Function[];
    protected addEvent<T extends EventBase = EventBase>(event: T): this;
    protected clearEvents(): this;
    commit(): Promise<this>;
    uncommit(): this;
    getUncommittedEvents(): EventBase[];
    loadFromHistory(history: EventBase[]): void;
    apply<T extends EventBase = EventBase>(event: T, isFromHistory?: boolean): Promise<void>;
    private getEventHandler;
    private getEventName;
}
export {};
