"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const persistent_subscription_nak_event_action_enum_1 = require("../../interfaces/events/persistent-subscription-nak-event-action.enum");
class EventHandlerHelper {
    static async onEvent(logger, subscription, payload, eventBus) {
        if (!eventBus) {
            return;
        }
        const { event } = payload;
        if (!payload.isResolved) {
            logger.warn(`Ignore unresolved event from stream ${payload.originalStreamId} with ID ${payload.originalEvent.eventId}`);
            if (!subscription._autoAck && subscription.hasOwnProperty('_autoAck')) {
                await subscription.acknowledge([payload]);
            }
            return;
        }
        if (!event.isJson) {
            logger.warn(`Received event that could not be resolved! stream ${event.eventStreamId} type ${event.eventType} id ${event.eventId} `);
            if (!subscription._autoAck && subscription.hasOwnProperty('_autoAck')) {
                await subscription.acknowledge([payload]);
            }
            return;
        }
        let data = {};
        try {
            data = JSON.parse(event.data.toString());
        }
        catch (e) {
            logger.warn(`Received event of type ${event.eventType} with shitty data acknowledge`);
            if (!subscription._autoAck && subscription.hasOwnProperty('_autoAck')) {
                await subscription.acknowledge([payload]);
            }
            return;
        }
        let metadata = {};
        if (event.metadata.toString()) {
            metadata = { ...metadata, ...JSON.parse(event.metadata.toString()) };
        }
        const finalEvent = eventBus.map(data, {
            metadata,
            eventStreamId: event.eventStreamId,
            eventId: event.eventId,
            eventNumber: event.eventNumber.low,
            eventType: event.eventType,
            originalEventId: payload.originalEvent.eventId || event.eventId,
        });
        if (!finalEvent) {
            logger.warn(`Received event of type ${event.eventType} with no declared handler acknowledge`);
            if (!subscription._autoAck && subscription.hasOwnProperty('_autoAck')) {
                await subscription.acknowledge([payload]);
            }
            return;
        }
        if (subscription.hasOwnProperty('_autoAck')) {
            if (typeof finalEvent.ack == 'function' &&
                typeof finalEvent.nack == 'function') {
                const ack = async () => {
                    logger.debug(`Acknowledge event ${event.eventType} with id ${event.eventId}`);
                    return subscription.acknowledge([payload]);
                };
                const nack = async (action, reason) => {
                    logger.debug(`Nak and ${Object.keys(persistent_subscription_nak_event_action_enum_1.PersistentSubscriptionNakEventAction)[action]} for event ${event.eventType} with id ${event.eventId} : reason ${reason}`);
                    return subscription.fail([payload], action, reason);
                };
                finalEvent.ack = ack;
                finalEvent.nack = nack;
            }
            else {
                logger.debug(`Auto acknowledge event ${event.eventType} with id ${event.eventId}`);
                subscription.acknowledge([payload]);
            }
        }
        await eventBus.publish(finalEvent);
    }
}
exports.default = EventHandlerHelper;
