import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { InvoiceDto } from '../../model';
import { Application } from '../interfaces/application.interface';

@Injectable()
export class AEMService {
  baseUrl = environment.apiRootUrl;
  apiPath = this.baseUrl.concat('api/AEM');

  headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) {}

  public getVictimApplicationPDF(application: Application) {
    return this.http
      .post(this.apiPath + '/victim', application, { headers: this.headers })
      .pipe(retry(3), catchError(this.handleError));
  }

  public getIFMApplicationPDF(application: Application) {
    return this.http
      .post(this.apiPath + '/ifm', application, { headers: this.headers })
      .pipe(retry(3), catchError(this.handleError));
  }

  public getWitnessApplicationPDF(application: Application) {
    return this.http
      .post(this.apiPath + '/witness', application, { headers: this.headers })
      .pipe(retry(3), catchError(this.handleError));
  }

  public getAuthorizationPDF(application: Application) {
    return this.http
      .post(this.apiPath + '/authorization', application, { headers: this.headers })
      .pipe(retry(3), catchError(this.handleError));
  }

  public getInvoicePDF(invoice: InvoiceDto) {
    return this.http
      .post(this.apiPath + '/invoice', invoice, { headers: this.headers })
      .pipe(retry(3), catchError(this.handleError));
  }

  public getErrorStatus(error: string): number {
    if (error.includes('Backend returned code 400')) {
      return 400;
    }
    if (error.includes('Backend returned code 404')) {
      return 404;
    }
    if (error.includes('Backend returned code 500')) {
      return 500;
    }
    return 0;
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
