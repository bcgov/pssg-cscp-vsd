import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Configuration } from '../interfaces/configuration.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });
  baseUrl = environment.apiRootUrl;
  apiPath = this.baseUrl.concat('api/Configuration');

  constructor(private http: HttpClient) {}

  public async load(): Promise<Configuration> {
    try {
      return await this.http
        .get<Configuration>(this.apiPath, { headers: this.headers })
        .pipe(catchError(this.handleError))
        .toPromise();
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  protected handleError(error): Observable<never> {
    if (error.error instanceof ErrorEvent) {
      return throwError(`Failed to load configuration: ${(<ErrorEvent>error.error).message}`);
    }

    return throwError(`Failed to load configuration: ${(<HttpErrorResponse>error).message}`);
  }
}
