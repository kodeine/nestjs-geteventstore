"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EventStoreModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventStoreModule = void 0;
const common_1 = require("@nestjs/common");
const event_store_1 = require("./event-store");
const health_1 = require("./health");
const commonProvidersAndExports = {
    providers: [health_1.EventStoreHealthIndicator, health_1.EventStoreSubscriptionHealthIndicator],
    exports: [
        event_store_1.EventStore,
        health_1.EventStoreHealthIndicator,
        health_1.EventStoreSubscriptionHealthIndicator,
    ],
};
let EventStoreModule = EventStoreModule_1 = class EventStoreModule {
    static register(config) {
        return {
            module: EventStoreModule_1,
            ...commonProvidersAndExports,
            providers: [
                {
                    provide: event_store_1.EventStore,
                    useValue: new event_store_1.EventStore(config),
                },
                ...commonProvidersAndExports.providers,
            ],
        };
    }
    static registerAsync(options) {
        return {
            module: EventStoreModule_1,
            ...commonProvidersAndExports,
            providers: [
                {
                    provide: event_store_1.EventStore,
                    useFactory: async (configService) => {
                        const config = await options.useFactory(configService);
                        return new event_store_1.EventStore(config);
                    },
                    inject: [...options.inject],
                },
                ...commonProvidersAndExports.providers,
            ],
        };
    }
};
EventStoreModule = EventStoreModule_1 = __decorate([
    (0, common_1.Module)({
        providers: [event_store_1.EventStore],
        exports: [event_store_1.EventStore],
    })
], EventStoreModule);
exports.EventStoreModule = EventStoreModule;
