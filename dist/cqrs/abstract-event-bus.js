"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractEventBus = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const rxjs_1 = require("rxjs");
class AbstractEventBus extends cqrs_1.EventBus {
    constructor(commandBus, moduleRef, unhandledExceptionBus) {
        super(commandBus, moduleRef, unhandledExceptionBus);
        this.logger = new common_1.Logger(this.constructor.name);
        this.exceptionBus = unhandledExceptionBus;
        this.cmdBus = commandBus;
    }
    bind(handler, id) {
        const stream$ = id ? this.ofEventId(id) : this.subject$;
        const subscription = stream$
            .pipe((0, rxjs_1.mergeMap)((event) => (0, rxjs_1.defer)(() => Promise.resolve(handler.handle(event))).pipe()))
            .subscribe();
        this.subscriptions.push(subscription);
    }
    registerSaga(saga) {
        if (typeof saga !== 'function') {
            throw new cqrs_1.InvalidSagaException();
        }
        const stream$ = saga(this);
        if (!(stream$ instanceof rxjs_1.Observable)) {
            throw new cqrs_1.InvalidSagaException();
        }
        const subscription = stream$
            .pipe((0, rxjs_1.filter)((e) => !!e), (0, rxjs_1.mergeMap)((command) => (0, rxjs_1.defer)(() => this.cmdBus.execute(command)).pipe((0, rxjs_1.catchError)((error) => {
            const unhandledError = this._mapToUnhandledErrorInfo(command, error);
            this.exceptionBus.publish(unhandledError);
            this.logger.error(`Command handler which execution was triggered by Saga has thrown an unhandled exception.`, error);
            return (0, rxjs_1.throwError)(() => error);
        }))))
            .subscribe();
        this.subscriptions.push(subscription);
    }
    _mapToUnhandledErrorInfo(eventOrCommand, exception) {
        return {
            cause: eventOrCommand,
            exception,
        };
    }
}
exports.AbstractEventBus = AbstractEventBus;
