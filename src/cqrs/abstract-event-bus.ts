import { Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
    CommandBus,
    EventBus,
    ICommand,
    IEvent,
    IEventHandler,
    ISaga,
    InvalidSagaException,
    UnhandledExceptionBus,
    UnhandledExceptionInfo,
} from '@nestjs/cqrs';
import { Observable, filter, mergeMap, defer, catchError, of, throwError, from } from 'rxjs';

export class AbstractEventBus<
  EventBase,
> extends EventBus<EventBase> {
  protected logger = new Logger(this.constructor.name);
  protected exceptionBus: UnhandledExceptionBus;
  protected cmdBus: CommandBus;

  constructor(
    commandBus: CommandBus,
    moduleRef: ModuleRef,
    unhandledExceptionBus: UnhandledExceptionBus,
  ) {
    super(commandBus, moduleRef, unhandledExceptionBus);
    this.exceptionBus = unhandledExceptionBus;
    this.cmdBus = commandBus;
  }

  bind(handler: IEventHandler<EventBase>, id: string) {
    const stream$ = id ? this.ofEventId(id) : this.subject$;
    const subscription = stream$
      .pipe(
        mergeMap((event) =>
          defer(() => Promise.resolve(handler.handle(event))).pipe(
            // catchError((error) => {
            //   const unhandledError = this.mapToUnhandledErrorInfo(event, error);
            //   this.exceptionBus.publish(unhandledError);
            //   this.logger.error(
            //     `"${handler.constructor.name}" has thrown an unhandled exception.`,
            //     error,
            //   );
            //   return of();
            // }),
          ),
        ),
      )
      .subscribe();
    this.subscriptions.push(subscription);
  }

  protected registerSaga(saga: ISaga<EventBase>) {
    if (typeof saga !== 'function') {
      throw new InvalidSagaException();
    }
    const stream$ = saga(this);
    if (!(stream$ instanceof Observable)) {
      throw new InvalidSagaException();
    }

    const subscription = stream$
      .pipe(
        filter((e) => !!e),
        mergeMap((command) =>
          defer(() => this.cmdBus.execute(command)).pipe(
            catchError((error) => {
              const unhandledError = this._mapToUnhandledErrorInfo(
                command,
                error,
              );
              this.exceptionBus.publish(unhandledError);
              this.logger.error(
                `Command handler which execution was triggered by Saga has thrown an unhandled exception.`,
                error,
              );
              // return of();
              return throwError(() => error);
            }),
          ),
        ),
      )
      .subscribe();

    this.subscriptions.push(subscription);
  }

  private _mapToUnhandledErrorInfo(
    eventOrCommand: IEvent | ICommand,
    exception: unknown,
  ): UnhandledExceptionInfo {
    return {
      cause: eventOrCommand,
      exception,
    };
  }
}
