import { retry, catchError } from 'rxjs/operators';
import { Observable, throwError, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class LookupService {
  // this should query the test api
  apiUrl = 'api/Lookup';

  constructor(
    private http: HttpClient,
  ) { }

  getCountries(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/countries`, { headers: this.headers }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  getProvinces(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/provinces`, { headers: this.headers }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  getCities(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cities`, { headers: this.headers }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  getCitiesByCountry(country: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/country/${country}/cities`, { headers: this.headers }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  getCitiesByProvince(country: string, province: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/country/${country}/province/${province}/cities`, { headers: this.headers }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  getRelationships(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/relationships`, { headers: this.headers }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  getPoliceDetachments(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/police_detachments`, { headers: this.headers }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  getCourts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/courts`, { headers: this.headers }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }
  

  get headers(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }
  protected handleError(err): Observable<never> {
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = err.error.message;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}, body was: ${err.message}`;
    }
    return throwError(errorMessage);
  }
}
