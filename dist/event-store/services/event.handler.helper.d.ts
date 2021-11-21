import { Logger } from '@nestjs/common';
import { ReadEventBus } from '../../cqrs';
export default class EventHandlerHelper {
    static onEvent(logger: Logger, subscription: any, payload: any, eventBus?: ReadEventBus): Promise<any>;
}
