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
        if (!environment.production)
            console.info(value, rest);
    }

    log(value: any, ...rest: any[]): void {
        if (!environment.production)
            console.log(value, rest);
    }

    warn(value: any, ...rest: any[]): void {
        if (!environment.production)
            console.warn(value, rest);
    }   

    error(value: any, ...rest: any[]): void {
        if (!environment.production)
            console.error(value, rest);
    }
}
