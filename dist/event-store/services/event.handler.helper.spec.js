"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_handler_helper_1 = require("./event.handler.helper");
const common_1 = require("@nestjs/common");
describe('EventHandlerHelper', () => {
    jest.mock('@nestjs/common');
    beforeEach(() => {
        jest.spyOn(common_1.Logger, 'log').mockImplementation(() => null);
        jest.spyOn(common_1.Logger, 'error').mockImplementation(() => null);
        jest.spyOn(common_1.Logger, 'debug').mockImplementation(() => null);
    });
    it('should be callable', () => {
        const result = event_handler_helper_1.default.onEvent(common_1.Logger, {}, {});
        expect(result).toBeTruthy();
    });
});
