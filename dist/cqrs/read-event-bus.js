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
exports.ReadEventBus = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const default_event_mapper_1 = require("./default-event-mapper");
const common_2 = require("@nestjs/common");
const constants_1 = require("../constants");
const core_1 = require("@nestjs/core");
const event_bus_prepublish_service_1 = require("./event-bus-prepublish.service");
let ReadEventBus = class ReadEventBus extends cqrs_1.EventBus {
    constructor(config, prepublish, commandBus, moduleRef) {
        super(commandBus, moduleRef);
        this.config = config;
        this.prepublish = prepublish;
        this.logger = new common_1.Logger(this.constructor.name);
        this.logger.debug('Registering Read EventBus for EventStore...');
    }
    async publish(event) {
        this.logger.debug('Publish in read bus');
        const preparedEvents = await this.prepublish.prepare(this.config, [event]);
        if (!(await this.prepublish.validate(this.config, preparedEvents))) {
            return;
        }
        return super.publish(preparedEvents[0]);
    }
    async publishAll(events) {
        this.logger.debug('Publish all in read bus');
        const preparedEvents = await this.prepublish.prepare(this.config, events);
        if (!(await this.prepublish.validate(this.config, preparedEvents))) {
            return;
        }
        return super.publishAll(preparedEvents);
    }
    map(data, options) {
        const eventMapper = this.config.eventMapper || (0, default_event_mapper_1.defaultEventMapper)(this.config.allowedEvents);
        return eventMapper(data, options);
    }
};
ReadEventBus = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_2.Inject)(constants_1.READ_EVENT_BUS_CONFIG)),
    __metadata("design:paramtypes", [Object, event_bus_prepublish_service_1.EventBusPrepublishService,
        cqrs_1.CommandBus,
        core_1.ModuleRef])
], ReadEventBus);
exports.ReadEventBus = ReadEventBus;
