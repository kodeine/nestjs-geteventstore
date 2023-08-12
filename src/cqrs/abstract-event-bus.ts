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
      .pipe(mergeMap((event) => from(Promise.resolve(handler.handle(event)))))
      .subscribe({
        error: (error) => {
          this.logger.error(
            `"${handler.constructor.name}" has thrown an unhandled exception.`,
            error,
          );
        },
      });
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
        mergeMap((command) => from(this.cmdBus.execute(command))),
        catchError(err => {
          console.warn('es catchError', err);
          return throwError(() => err);
        })
      )
      .subscribe({
        error: (error) => {
          this.logger.error(
            `Command handler which execution was triggered by Saga has thrown an unhandled exception.`,
            error,
          );
        },
      });

    this.subscriptions.push(subscription);
  }

  // private mapToUnhandledErrorInfo(
  //   eventOrCommand: IEvent | ICommand,
  //   exception: unknown,
  // ): UnhandledExceptionInfo {
  //   return {
  //     cause: eventOrCommand,
  //     exception,
  //   };
  // }
}
