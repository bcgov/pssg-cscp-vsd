import { Injectable } from '@angular/core';

@Injectable()
export class StateService {
    data: any;
    cloning: boolean = false;
    constructor() { }
}
