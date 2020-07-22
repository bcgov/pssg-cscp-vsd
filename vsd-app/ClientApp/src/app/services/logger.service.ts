import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface ILoggerService {
    info(value: any, ...rest: any[]): void;
    log(value: any, ...rest: any[]): void;
    warn(value: any, ...rest: any[]): void;
    error(value: any, ...rest: any[]): void;
}

@Injectable({
    providedIn: 'root'
})
export class ConsoleLoggerService implements ILoggerService {

    info(value: any, ...rest: any[]): void {
        if (!environment.production) {
            if (rest.length > 0)
                console.info(value, rest);
            else
                console.info(value);
        }
    }

    log(value: any, ...rest: any[]): void {
        if (!environment.production) {
            if (rest.length > 0)
                console.log(value, rest);
            else
                console.log(value);
        }
    }

    warn(value: any, ...rest: any[]): void {
        if (!environment.production) {
            if (rest.length > 0)
                console.warn(value, rest);
            else
                console.warn(value);
        }
    }

    error(value: any, ...rest: any[]): void {
        if (!environment.production) {
            if (rest.length > 0)
                console.error(value, rest);
            else
                console.error(value);
        }
    }
}
