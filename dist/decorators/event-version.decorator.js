"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventVersion = void 0;
const EventVersion = (version) => (BaseEvent) => {
    const newClass = class extends BaseEvent {
        constructor(...args) {
            super(...args);
            this.metadata.version = version;
        }
    };
    Object.defineProperty(newClass, 'name', {
        value: BaseEvent.name,
    });
    return newClass;
};
exports.EventVersion = EventVersion;
