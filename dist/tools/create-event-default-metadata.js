"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventDefaultMetadata = void 0;
const createEventDefaultMetadata = () => ({
    time: new Date().toISOString(),
    version: 1,
});
exports.createEventDefaultMetadata = createEventDefaultMetadata;
