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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriteEventsPrepublishService = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const nestjs_context_1 = require("nestjs-context");
const create_event_default_metadata_1 = require("../tools/create-event-default-metadata");
const net_1 = require("net");
let WriteEventsPrepublishService = class WriteEventsPrepublishService {
    constructor(context) {
        this.context = context;
        this.logger = new common_1.Logger(this.constructor.name);
    }
    async onValidationFail(events, errors) {
        const errorDetails = this.flattenDetails(errors);
        this.logger.error(`Validation found ${errors.length} errors: ${JSON.stringify(errorDetails)}`);
    }
    getErrorDetails(event, error, parent = null) {
        const field = parent ? `${parent}.${error.property}` : error.property;
        const details = [];
        if (error.constraints) {
            for (const [issue, description] of Object.entries(error.constraints)) {
                const errorDetail = {
                    event,
                    field,
                    value: error.value,
                    issue,
                    description,
                };
                details.push(errorDetail);
            }
        }
        else {
            details.push({
                field,
                value: error.value,
                issue: 'unknown',
                description: '',
            });
        }
        return details;
    }
    flattenDetails(validationErrors, parent = null, event = null) {
        return validationErrors
            .map((validationError) => {
            if (validationError.children.length) {
                return this.flattenDetails(validationError.children, parent
                    ? `${parent}.${validationError.property}`
                    : validationError.property, event || validationError.target.constructor.name);
            }
            else {
                return this.getErrorDetails(event, validationError, parent);
            }
        })
            .flat();
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
            const eventType = `${hostnameArr[1] ? hostnameArr[1] + '.' : ''}${hostnameArr[0]}.${this.context.get(nestjs_context_1.CONTEXT_BIN)}.${event.eventType}.${version}`;
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
    __metadata("design:paramtypes", [nestjs_context_1.Context])
], WriteEventsPrepublishService);
exports.WriteEventsPrepublishService = WriteEventsPrepublishService;
