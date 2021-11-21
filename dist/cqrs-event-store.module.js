"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CqrsEventStoreModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CqrsEventStoreModule = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const event_store_module_1 = require("./event-store/event-store.module");
const cqrs_2 = require("./cqrs");
const constants_1 = require("./constants");
const event_bus_prepublish_service_1 = require("./cqrs/event-bus-prepublish.service");
const cloudevents_1 = require("./cloudevents");
const nestjs_context_1 = require("nestjs-context");
const explorer_service_1 = require("@nestjs/cqrs/dist/services/explorer.service");
const getDefaultEventBusConfiguration = {
    context: nestjs_context_1.ContextName.HTTP,
    validate: cloudevents_1.WriteEventsPrepublishService,
    prepare: cloudevents_1.WriteEventsPrepublishService,
};
let CqrsEventStoreModule = CqrsEventStoreModule_1 = class CqrsEventStoreModule extends cqrs_1.CqrsModule {
    static register(eventStoreConfig, eventStoreSubsystems = {
        onConnectionFail: (e) => console.log('e : ', e),
    }, eventBusConfig = {}) {
        return {
            module: CqrsEventStoreModule_1,
            imports: [
                event_store_module_1.EventStoreModule.register(eventStoreConfig, eventStoreSubsystems),
            ],
            providers: [
                { provide: constants_1.READ_EVENT_BUS_CONFIG, useValue: eventBusConfig.read },
                {
                    provide: constants_1.WRITE_EVENT_BUS_CONFIG,
                    useValue: { ...getDefaultEventBusConfiguration, ...eventBusConfig },
                },
            ],
            exports: [event_store_module_1.EventStoreModule],
        };
    }
    static registerReadBus(eventStoreConfig, eventBusConfig, subscriptions = []) {
        return {
            module: CqrsEventStoreModule_1,
            imports: [
                event_store_module_1.EventStoreModule.register(eventStoreConfig, {
                    subscriptions: { persistent: subscriptions },
                    onConnectionFail: (e) => console.log('e : ', e),
                }),
            ],
            providers: [
                { provide: constants_1.READ_EVENT_BUS_CONFIG, useValue: eventBusConfig },
                { provide: cqrs_1.EventBus, useExisting: cqrs_2.ReadEventBus },
            ],
            exports: [event_store_module_1.EventStoreModule],
        };
    }
    static registerWriteBus(eventStoreConfig, eventBusConfig = {}) {
        return {
            module: CqrsEventStoreModule_1,
            imports: [event_store_module_1.EventStoreModule.register(eventStoreConfig)],
            providers: [
                {
                    provide: constants_1.WRITE_EVENT_BUS_CONFIG,
                    useValue: { ...getDefaultEventBusConfiguration, ...eventBusConfig },
                },
            ],
            exports: [event_store_module_1.EventStoreModule],
        };
    }
};
CqrsEventStoreModule = CqrsEventStoreModule_1 = __decorate([
    (0, common_1.Module)({
        providers: [
            cloudevents_1.WriteEventsPrepublishService,
            event_bus_prepublish_service_1.EventBusPrepublishService,
            explorer_service_1.ExplorerService,
            cqrs_2.WriteEventBus,
            cqrs_2.ReadEventBus,
            cqrs_1.CommandBus,
            cqrs_1.QueryBus,
            { provide: cqrs_1.EventBus, useExisting: cqrs_2.ReadEventBus },
        ],
        exports: [
            cloudevents_1.WriteEventsPrepublishService,
            event_bus_prepublish_service_1.EventBusPrepublishService,
            explorer_service_1.ExplorerService,
            cqrs_2.WriteEventBus,
            cqrs_2.ReadEventBus,
            cqrs_1.CommandBus,
            cqrs_1.QueryBus,
            cqrs_1.EventBus,
        ],
    })
], CqrsEventStoreModule);
exports.CqrsEventStoreModule = CqrsEventStoreModule;
