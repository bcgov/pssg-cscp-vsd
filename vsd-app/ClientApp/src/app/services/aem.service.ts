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

    public getVictimApplicationPDF(application: Application) {
        return this.http.post(this.apiPath + '/victim', application, { headers: this.headers });
    }

    public getIFMApplicationPDF(application: Application) {
        return this.http.post(this.apiPath + '/ifm', application, { headers: this.headers });
    }

    public getWitnessApplicationPDF(application: Application) {
        return this.http.post(this.apiPath + '/witness', application, { headers: this.headers });
    }
}
