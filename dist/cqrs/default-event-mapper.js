"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultEventMapper = void 0;
const common_1 = require("@nestjs/common");
const defaultEventMapper = (allEvents) => {
    const logger = new common_1.Logger('Default Event Mapper');
    return ((data, options) => {
        const className = `${options.eventType}`;
        if (allEvents[className]) {
            logger.log(`Build ${className} received from stream ${options.eventStreamId} with id ${options.eventId} and number ${options.eventNumber}`);
            return new allEvents[className](data, options);
        }
        return null;
    });
};
exports.defaultEventMapper = defaultEventMapper;
