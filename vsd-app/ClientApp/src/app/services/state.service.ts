import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { VersionInfo } from '../models/version-info.model';

@Injectable()
export class StateService {
    data: any;
    cloning: boolean = false;
    constructor() { }

}
