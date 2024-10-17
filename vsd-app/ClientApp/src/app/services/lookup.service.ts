import { retry, catchError } from 'rxjs/operators';
import { Observable, throwError, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class LookupService {
  // this should query the test api
  baseUrl = environment.apiRootUrl;
  apiPath = this.baseUrl.concat('api/Lookup');

  cvapEmail: string = "";
  cvapCounsellingEmail: string = "";

  constructor(
    private http: HttpClient,
  ) { }

  getCVAPEmails(): Observable<any> {
    return this.http.get<any>(`${this.apiPath}/cvap-emails`, { headers: this.headers }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  getCountries(): Observable<any> {
    return this.http.get<any>(`${this.apiPath}/countries`, { headers: this.headers }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  getProvinces(): Observable<any> {
    return this.http.get<any>(`${this.apiPath}/provinces`, { headers: this.headers }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  getCities(): Observable<any> {
    return this.http.get<any>(`${this.apiPath}/cities`, { headers: this.headers }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  searchCities(country: string, province: string, searchVal: string): Observable<any> {
    let limit = 15;
    return this.http.get<any>(`${this.apiPath}/cities/search?country=${country}&province=${province}&searchVal=${searchVal}&limit=${limit}`, { headers: this.headers }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }


  getCitiesByCountry(country_id: string): Observable<any> {
    return this.http.get<any>(`${this.apiPath}/country/${country_id}/cities`, { headers: this.headers }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  getCitiesByProvince(country_id: string, province_id: string): Observable<any> {
    return this.http.get<any>(`${this.apiPath}/country/${country_id}/province/${province_id}/cities`, { headers: this.headers }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  getRelationships(): Observable<any> {
    return this.http.get<any>(`${this.apiPath}/relationships`, { headers: this.headers }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  getOptionalAuthorizationRelationships(): Observable<any> {
    return this.http.get<any>(`${this.apiPath}/auth_relationships`, { headers: this.headers }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  getRepresentativeRelationships(): Observable<any> {
    return this.http.get<any>(`${this.apiPath}/representative_relationships`, { headers: this.headers }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  getRestitutionRelationships(): Observable<any> {
    return this.http.get<any>(`${this.apiPath}/restitution_relationships`, { headers: this.headers }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  getPoliceDetachments(): Observable<any> {
    return this.http.get<any>(`${this.apiPath}/police_detachments`, { headers: this.headers }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  getCourts(): Observable<any> {
    return this.http.get<any>(`${this.apiPath}/courts`, { headers: this.headers }).pipe(
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
