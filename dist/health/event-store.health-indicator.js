"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventStoreHealthIndicator = void 0;
const event_store_1 = require("../event-store");
const terminus_1 = require("@nestjs/terminus");
const common_1 = require("@nestjs/common");
let EventStoreHealthIndicator = class EventStoreHealthIndicator extends terminus_1.HealthIndicator {
    constructor(eventStore) {
        super();
        this.eventStore = eventStore;
    }
    check() {
        if (!this.eventStore.isConnected) {
            throw new terminus_1.HealthCheckError(`EventStore connection lost`, {
                eventStore: `Connection lost to ${this.eventStore.config.tcp.host}:${this.eventStore.config.tcp.port}`,
            });
        }
        return super.getStatus('eventStore', true, {
            message: `Connected to ${this.eventStore.config.tcp.host}:${this.eventStore.config.tcp.port}`,
        });
    }
};
EventStoreHealthIndicator = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_store_1.EventStore])
], EventStoreHealthIndicator);
exports.EventStoreHealthIndicator = EventStoreHealthIndicator;
