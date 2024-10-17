import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Application } from '../interfaces/application.interface';
import { CounsellorInvoice } from '../interfaces/counsellor-invoice.interface';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class AEMService {
    baseUrl = environment.apiRootUrl;
    apiPath = this.baseUrl.concat('api/AEM');

    headers: HttpHeaders = new HttpHeaders({
        'Content-Type': 'application/json'
    });

    constructor(private http: HttpClient) { }

    public getVictimApplicationPDF(application: Application) {
        return this.http.post(this.apiPath + '/victim', application, { headers: this.headers }).pipe(
            retry(3),
            catchError(this.handleError)
        );
    }

    public getIFMApplicationPDF(application: Application) {
        return this.http.post(this.apiPath + '/ifm', application, { headers: this.headers }).pipe(
            retry(3),
            catchError(this.handleError)
        );
    }

    public getWitnessApplicationPDF(application: Application) {
        return this.http.post(this.apiPath + '/witness', application, { headers: this.headers }).pipe(
            retry(3),
            catchError(this.handleError)
        );
    }

    public getAuthorizationPDF(application: Application) {
        return this.http.post(this.apiPath + '/authorization', application, { headers: this.headers }).pipe(
            retry(3),
            catchError(this.handleError)
        );
    }

    public getInvoicePDF(invoice: CounsellorInvoice) {
        return this.http.post(this.apiPath + '/invoice', invoice, { headers: this.headers }).pipe(
            retry(3),
            catchError(this.handleError)
        );
    }

    protected handleError(err): Observable<never> {
        let errorMessage = '';
        console.log(err);
        if (err.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            errorMessage = err.error.message;
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            errorMessage = `Backend returned code ${err.status}, body was: ${JSON.stringify(err.error)}`;
        }
        return throwError(errorMessage);
    }
}
