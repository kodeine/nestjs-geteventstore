"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidPublisherException = void 0;
const common_1 = require("@nestjs/common");
class InvalidPublisherException extends common_1.HttpException {
    constructor(publisher, method) {
        super(`Invalid publisher: expected ${publisher.constructor.name + '::' + method} to be a function`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.InvalidPublisherException = InvalidPublisherException;
