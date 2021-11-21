"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidEventException = void 0;
const common_1 = require("@nestjs/common");
class InvalidEventException extends common_1.HttpException {
    constructor(errors) {
        super(errors, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.InvalidEventException = InvalidEventException;
