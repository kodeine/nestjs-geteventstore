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
exports.WriteEventsPrepublishService = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const nestjs_context_1 = require("nestjs-context");
const constants_1 = require("../constants");
const create_event_default_metadata_1 = require("../tools/create-event-default-metadata");
const net_1 = require("net");
let WriteEventsPrepublishService = class WriteEventsPrepublishService {
    constructor(context, config) {
        this.context = context;
        this.config = config;
        this.logger = new common_1.Logger(this.constructor.name);
    }
    async onValidationFail(events, errors) {
        for (const error of errors) {
            this.logger.error(error);
        }
    }
    async validate(events) {
        let errors = [];
        for (const event of events) {
            this.logger.debug(`Validating ${event.constructor.name}`);
            const validateEvent = (0, class_transformer_1.plainToClass)(event.constructor, event);
            errors = [...errors, ...(await (0, class_validator_1.validate)(validateEvent))];
        }
        return errors;
    }
    getCloudEventMetadata(event) {
        try {
            const { version: defaultVersion, time } = (0, create_event_default_metadata_1.createEventDefaultMetadata)();
            const version = event?.metadata?.version ?? defaultVersion;
            const hostnameRaw = this.context.get(nestjs_context_1.CONTEXT_HOSTNAME);
            const hostname = (0, net_1.isIPv4)(hostnameRaw)
                ? `${hostnameRaw.split(/[.]/).join('-')}.ip`
                : hostnameRaw;
            const hostnameArr = hostname.split('.');
            const eventType = `${hostnameArr[1] ? hostnameArr[1] + '.' : ''}${hostnameArr[0]}.${this.config.serviceName ?? this.context.get(nestjs_context_1.CONTEXT_BIN)}.${event.eventType}.${version}`;
            const source = `${hostname}${this.context.get(nestjs_context_1.CONTEXT_PATH)}`;
            return {
                specversion: 1,
                time,
                version,
                correlation_id: this.context.get(nestjs_context_1.CONTEXT_CORRELATION_ID),
                type: eventType,
                source,
            };
        }
        catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    async prepare(events) {
        const preparedEvents = [];
        for (const event of events) {
            this.logger.debug(`Preparing ${event.constructor.name}`);
            const preparedEvent = event;
            preparedEvent.metadata = {
                ...this.getCloudEventMetadata(event),
                ...(event.metadata ?? {}),
            };
            preparedEvents.push(preparedEvent);
        }
        return preparedEvents;
    }
};
WriteEventsPrepublishService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(constants_1.WRITE_EVENT_BUS_CONFIG)),
    __metadata("design:paramtypes", [nestjs_context_1.Context, Object])
], WriteEventsPrepublishService);
exports.WriteEventsPrepublishService = WriteEventsPrepublishService;
