"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregateRoot = void 0;
const common_1 = require("@nestjs/common");
const invalid_publisher_exception_1 = require("../exceptions/invalid-publisher.exception");
const INTERNAL_EVENTS = Symbol();
const IS_AUTO_COMMIT_ENABLED = Symbol();
class AggregateRoot {
    constructor() {
        this.logger = new common_1.Logger(this.constructor.name);
        this[_a] = false;
        this[_b] = [];
        this._publishers = [];
    }
    set autoCommit(value) {
        this[IS_AUTO_COMMIT_ENABLED] = value;
    }
    get autoCommit() {
        return this[IS_AUTO_COMMIT_ENABLED];
    }
    addPublisher(publisher, method = 'publishAll') {
        const objectPublisher = publisher?.[method];
        const addedPublisher = !!objectPublisher && typeof objectPublisher === 'function'
            ? objectPublisher.bind(publisher)
            : publisher;
        if (typeof addedPublisher === 'function') {
            this._publishers.push(addedPublisher);
            return this;
        }
        throw new invalid_publisher_exception_1.InvalidPublisherException(publisher, method);
    }
    get publishers() {
        return this._publishers;
    }
    addEvent(event) {
        this[INTERNAL_EVENTS].push(event);
        return this;
    }
    clearEvents() {
        this[INTERNAL_EVENTS].length = 0;
        return this;
    }
    async commit() {
        this.logger.debug(`Aggregate will commit ${this.getUncommittedEvents().length} in ${this.publishers.length} publishers`);
        const events = this.getUncommittedEvents();
        this.clearEvents();
        for (const publisher of this.publishers) {
            await publisher(events).catch((error) => {
                this[INTERNAL_EVENTS].unshift(...events);
                throw error;
            });
        }
        return this;
    }
    uncommit() {
        this.clearEvents();
        return this;
    }
    getUncommittedEvents() {
        return this[INTERNAL_EVENTS];
    }
    loadFromHistory(history) {
        history.forEach((event) => this.apply(event, true));
    }
    async apply(event, isFromHistory = false) {
        this.logger.debug(`Applying ${event.constructor.name} with${!!this.autoCommit ? '' : 'out'} autocommit`);
        if (!isFromHistory) {
            this.addEvent(event);
        }
        this.autoCommit && (await this.commit());
        const handler = this.getEventHandler(event);
        handler && (await handler.call(this, event));
    }
    getEventHandler(event) {
        const handler = `on${this.getEventName(event)}`;
        return this[handler];
    }
    getEventName(event) {
        const { constructor } = Object.getPrototypeOf(event);
        return constructor.name;
    }
}
exports.AggregateRoot = AggregateRoot;
_a = IS_AUTO_COMMIT_ENABLED, _b = INTERNAL_EVENTS;
