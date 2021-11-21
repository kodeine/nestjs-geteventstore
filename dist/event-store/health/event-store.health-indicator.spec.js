"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_store_health_indicator_1 = require("./event-store.health-indicator");
const common_1 = require("@nestjs/common");
describe('EventStoreHealthIndicator', () => {
    let service;
    jest.mock('@nestjs/common');
    beforeEach(() => {
        service = new event_store_health_indicator_1.EventStoreHealthIndicator();
        jest.spyOn(common_1.Logger, 'log').mockImplementation(() => null);
        jest.spyOn(common_1.Logger, 'error').mockImplementation(() => null);
        jest.spyOn(common_1.Logger, 'debug').mockImplementation(() => null);
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    ['up', 'down'].forEach((status) => {
        it(`should be notified when connection is ${status}`, () => {
            const esHealthStatus = {
                connection: status,
            };
            service.updateStatus(esHealthStatus);
            const check = service.check();
            expect(check.connection.status).toEqual(status);
        });
    });
    ['up', 'down'].forEach((status) => {
        it(`should be notified when subscription's connection is ${status}`, () => {
            const esHealthStatus = {
                subscriptions: status,
            };
            service.updateStatus(esHealthStatus);
            const check = service.check();
            expect(check.subscriptions.status).toEqual(status);
        });
    });
});
