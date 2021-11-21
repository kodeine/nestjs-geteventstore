import { HttpException } from '@nestjs/common';
export declare class InvalidPublisherException<T extends object = Function> extends HttpException {
    constructor(publisher: T, method: keyof T);
}
