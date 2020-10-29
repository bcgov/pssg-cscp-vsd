import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Application } from '../interfaces/application.interface';

@Injectable()
export class AEMService {
    apiPath = 'api/AEM';
    headers: HttpHeaders = new HttpHeaders({
        'Content-Type': 'application/json'
    });

    constructor(private http: HttpClient) { }

    public getPDF(application: Application) {
        return this.http.post(this.apiPath + '/getPDF', application, { headers: this.headers });
    }
}
