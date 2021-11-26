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
exports.EventStoreSubscriptionHealthIndicator = void 0;
const common_1 = require("@nestjs/common");
const terminus_1 = require("@nestjs/terminus");
const event_store_1 = require("../event-store");
let EventStoreSubscriptionHealthIndicator = class EventStoreSubscriptionHealthIndicator extends terminus_1.HealthIndicator {
    constructor(eventStore) {
        super();
        this.eventStore = eventStore;
    }
    check() {
        let res = {}, causes = {};
        const subscriptions = this.eventStore.subscriptions.persistent;
        for (const subscriptionName in subscriptions) {
            if (!subscriptions.hasOwnProperty(subscriptionName)) {
                continue;
            }
            if (subscriptions[subscriptionName].isConnected === false) {
                causes[subscriptionName] = `Subscription ${subscriptions[subscriptionName].streamName} ${subscriptions[subscriptionName].group} dropped`;
                throw new terminus_1.HealthCheckError(`subscription-${subscriptionName}`, causes);
            }
            res[`subscription-${subscriptionName}`] = {
                status: 'up',
                message: `Connected to ${subscriptions[subscriptionName].streamName} ${subscriptions[subscriptionName].group}`,
            };
        }
        return res;
    }
};
EventStoreSubscriptionHealthIndicator = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_store_1.EventStore])
], EventStoreSubscriptionHealthIndicator);
exports.EventStoreSubscriptionHealthIndicator = EventStoreSubscriptionHealthIndicator;
