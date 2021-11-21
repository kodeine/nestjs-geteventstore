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
const index_1 = require("./index");
const health_1 = require("./health");
const constants_1 = require("../constants");
const event_store_service_interface_1 = require("./services/event-store.service.interface");
const db_client_1 = require("@eventstore/db-client");
const event_store_constants_1 = require("./services/event-store.constants");
const events_and_metadatas_stacker_1 = require("./reliability/interface/events-and-metadatas-stacker");
const in_memory_events_and_metadatas_stacker_1 = require("./reliability/implementations/in-memory/in-memory-events-and-metadatas-stacker");
let EventStoreModule = EventStoreModule_1 = class EventStoreModule {
    static async register(config, eventStoreSubsystems = {
        onConnectionFail: (e) => console.log('e : ', e),
    }) {
        return {
            module: EventStoreModule_1,
            providers: [
                {
                    provide: constants_1.EVENT_STORE_SUBSYSTEMS,
                    useValue: eventStoreSubsystems,
                },
                {
                    provide: events_and_metadatas_stacker_1.EVENTS_AND_METADATAS_STACKER,
                    useClass: in_memory_events_and_metadatas_stacker_1.default,
                },
                await this.getEventStoreConnector(config),
            ],
        };
    }
    static async getEventStoreConnector(config) {
        const eventStoreConnector = db_client_1.EventStoreDBClient.connectionString(config.connectionSettings
            .connectionString);
        return {
            provide: event_store_constants_1.EVENT_STORE_CONNECTOR,
            useValue: eventStoreConnector,
        };
    }
};
EventStoreModule = EventStoreModule_1 = __decorate([
    (0, common_1.Module)({
        providers: [
            health_1.EventStoreHealthIndicator,
            {
                provide: event_store_service_interface_1.EVENT_STORE_SERVICE,
                useClass: index_1.EventStoreService,
            },
        ],
        exports: [event_store_service_interface_1.EVENT_STORE_SERVICE, health_1.EventStoreHealthIndicator],
    })
], EventStoreModule);
exports.EventStoreModule = EventStoreModule;
