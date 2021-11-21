"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersistentSubscriptionNakEventAction = void 0;
var PersistentSubscriptionNakEventAction;
(function (PersistentSubscriptionNakEventAction) {
    PersistentSubscriptionNakEventAction[PersistentSubscriptionNakEventAction["Unknown"] = 0] = "Unknown";
    PersistentSubscriptionNakEventAction[PersistentSubscriptionNakEventAction["Park"] = 1] = "Park";
    PersistentSubscriptionNakEventAction[PersistentSubscriptionNakEventAction["Retry"] = 2] = "Retry";
    PersistentSubscriptionNakEventAction[PersistentSubscriptionNakEventAction["Skip"] = 3] = "Skip";
    PersistentSubscriptionNakEventAction[PersistentSubscriptionNakEventAction["Stop"] = 4] = "Stop";
})(PersistentSubscriptionNakEventAction = exports.PersistentSubscriptionNakEventAction || (exports.PersistentSubscriptionNakEventAction = {}));
