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
const event_store_module_1 = require("./event-store.module");
const cqrs_2 = require("./cqrs");
const constants_1 = require("./constants");
const event_store_1 = require("./event-store");
const event_bus_prepublish_service_1 = require("./cqrs/event-bus-prepublish.service");
const cloudevents_1 = require("./cloudevents");
const nestjs_context_1 = require("nestjs-context");
const isEventStoreConfig = (config) => {
    return !!config['credentials'];
};
const defaultWriteBusConfig = {
    context: nestjs_context_1.ContextName.HTTP,
    validate: cloudevents_1.WriteEventsPrepublishService,
    prepare: cloudevents_1.WriteEventsPrepublishService,
};
const registerEventStore = (config, serviceConfig = {}) => {
    return {
        imports: [
            isEventStoreConfig(config)
                ? event_store_module_1.EventStoreModule.register(config)
                : event_store_module_1.EventStoreModule.registerAsync(config),
        ],
        providers: [
            {
                provide: constants_1.EVENT_STORE_SERVICE_CONFIG,
                useValue: serviceConfig,
            },
            event_store_1.EventStoreService,
        ],
        exports: [event_store_module_1.EventStoreModule],
    };
};
let CqrsEventStoreModule = CqrsEventStoreModule_1 = class CqrsEventStoreModule extends cqrs_1.CqrsModule {
    static registerSubscriptions(eventStoreConfig, subscriptions, eventBusConfig) {
        return this.registerReadBus(eventStoreConfig, eventBusConfig, subscriptions);
    }
    static registerProjections(eventStoreConfig, projections) {
        const modules = [registerEventStore(eventStoreConfig, { projections })];
        return {
            module: CqrsEventStoreModule_1,
            imports: modules.map((module) => module.imports).flat(),
            provides: modules.map((module) => module.providers).flat(),
            exports: modules.map((module) => module.exports).flat(),
        };
    }
    static registerWriteBus(eventStoreConfig, eventBusConfig = {}) {
        const modules = [registerEventStore(eventStoreConfig)];
        const config = { ...defaultWriteBusConfig, ...eventBusConfig };
        return {
            module: CqrsEventStoreModule_1,
            imports: [
                ...modules.map((module) => module.imports).flat(),
            ],
            providers: [
                ...modules.map((module) => module.providers).flat(),
                cloudevents_1.WriteEventsPrepublishService,
                event_bus_prepublish_service_1.EventBusPrepublishService,
                cqrs_1.CommandBus,
                {
                    provide: constants_1.WRITE_EVENT_BUS_CONFIG,
                    useValue: config,
                },
                cqrs_2.WriteEventBus,
            ],
            exports: [
                ...modules.map((module) => module.exports).flat(),
                cqrs_1.CommandBus,
                cqrs_2.WriteEventBus,
            ],
        };
    }
    static registerReadBus(eventStoreConfig, eventBusConfig, subscriptions = {}) {
        const modules = [registerEventStore(eventStoreConfig, { subscriptions })];
        return {
            module: CqrsEventStoreModule_1,
            imports: modules.map((module) => module.imports).flat(),
            providers: [
                ...modules.map((module) => module.providers).flat(),
                event_bus_prepublish_service_1.EventBusPrepublishService,
                cqrs_1.QueryBus,
                {
                    provide: constants_1.READ_EVENT_BUS_CONFIG,
                    useValue: eventBusConfig,
                },
                cqrs_2.ReadEventBus,
                {
                    provide: cqrs_1.EventBus,
                    useExisting: cqrs_2.ReadEventBus,
                },
            ],
            exports: [
                ...modules.map((module) => module.exports).flat(),
                cqrs_1.QueryBus,
                cqrs_2.ReadEventBus,
                cqrs_1.EventBus,
            ],
        };
    }
    static register(eventStoreConfig, eventStoreServiceConfig = {}, eventBusConfig = {}) {
        const modules = [
            ...(eventBusConfig.write
                ? [this.registerWriteBus(eventStoreConfig, eventBusConfig.write)]
                : []),
            ...(eventBusConfig.read
                ? [this.registerReadBus(eventStoreConfig, eventBusConfig.read)]
                : []),
            registerEventStore(eventStoreConfig, eventStoreServiceConfig),
        ];
        return {
            module: CqrsEventStoreModule_1,
            imports: modules.map((module) => module.imports).flat(),
            providers: modules.map((module) => module.providers).flat(),
            exports: modules.map((module) => module.exports).flat(),
        };
    }
};
CqrsEventStoreModule = CqrsEventStoreModule_1 = __decorate([
    (0, common_1.Module)({})
], CqrsEventStoreModule);
exports.CqrsEventStoreModule = CqrsEventStoreModule;
