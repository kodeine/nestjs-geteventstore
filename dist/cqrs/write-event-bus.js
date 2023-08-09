"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriteEventBus = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const event_store_1 = require("../event-store");
const constants_1 = require("../constants");
const core_1 = require("@nestjs/core");
const event_bus_prepublish_service_1 = require("./event-bus-prepublish.service");
const invalid_event_exception_1 = require("../exceptions/invalid-event.exception");
let WriteEventBus = class WriteEventBus extends cqrs_1.EventBus {
    constructor(eventstore, config, prepublish, commandBus, moduleRef, unhandledExceptionBus) {
        super(commandBus, moduleRef, unhandledExceptionBus);
        this.eventstore = eventstore;
        this.config = config;
        this.prepublish = prepublish;
        this.logger = new common_1.Logger(this.constructor.name);
        this.logger.debug('Registering Write EventBus for EventStore...');
        this.publisher = new event_store_1.EventStorePublisher(this.eventstore, this.config);
    }
    async publish(event, context) {
        this.logger.debug('Publish in write bus');
        const preparedEvents = await this.prepublish.prepare(this.config, [event]);
        const validated = await this.prepublish.validate(this.config, preparedEvents);
        if (validated.length) {
            throw new invalid_event_exception_1.InvalidEventException(validated);
        }
        return await this.publisher.publish(preparedEvents, context);
    }
    async publishAll(events, context) {
        this.logger.debug('Publish All in write bus');
        const preparedEvents = await this.prepublish.prepare(this.config, events);
        const validated = await this.prepublish.validate(this.config, preparedEvents);
        if (validated.length) {
            throw new invalid_event_exception_1.InvalidEventException(validated);
        }
        return await this.publisher.publishAll(preparedEvents, context);
    }
};
WriteEventBus = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(constants_1.WRITE_EVENT_BUS_CONFIG)),
    __metadata("design:paramtypes", [event_store_1.EventStore, Object, event_bus_prepublish_service_1.EventBusPrepublishService,
        cqrs_1.CommandBus,
        core_1.ModuleRef,
        cqrs_1.UnhandledExceptionBus])
], WriteEventBus);
exports.WriteEventBus = WriteEventBus;
