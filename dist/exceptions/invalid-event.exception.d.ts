import { HttpException } from '@nestjs/common';
export declare class InvalidEventException extends HttpException {
    constructor(errors: Error[]);
}
