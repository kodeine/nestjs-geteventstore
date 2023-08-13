"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractEventBus = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
class AbstractEventBus extends cqrs_1.EventBus {
    constructor(commandBus, moduleRef, unhandledExceptionBus) {
        super(commandBus, moduleRef, unhandledExceptionBus);
        this.logger = new common_1.Logger(this.constructor.name);
    }
}
exports.AbstractEventBus = AbstractEventBus;
