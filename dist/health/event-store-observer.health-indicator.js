"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventStoreObserverHealthIndicator = void 0;
const terminus_1 = require("@nestjs/terminus");
class EventStoreObserverHealthIndicator extends terminus_1.HealthIndicator {
    check() {
        let res = [];
        return super.getStatus('subscription', true, {
            message: `Connected to subsbscriptions ${res.join(', ')}`,
        });
    }
}
exports.EventStoreObserverHealthIndicator = EventStoreObserverHealthIndicator;
