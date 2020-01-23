import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Application } from '../interfaces/application.interface';
import { CounsellorInvoice } from '../interfaces/counsellor-invoice.interface';
import { VictimRestitution } from '../interfaces/victim-restitution.interface';
import { OffenderRestitution } from '../interfaces/offender-restitution.interface';
import { Observable } from 'rxjs';

@Injectable()
export class JusticeApplicationDataService {
  apiPath = 'api/justice/';
  headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });
  weasyHeaders: HttpHeaders = new HttpHeaders({
    'Content-Type': 'string'
  });

  constructor(private http: HttpClient) { }

  public submitApplication(application: Application) {
    return this.http.post(this.apiPath + 'saveapplication', application, { headers: this.headers });
  }

  public submitCounsellorInvoice(counsellorInvoice: CounsellorInvoice) {
    return this.http.post(this.apiPath + 'submitcounsellorinvoice', counsellorInvoice, { headers: this.headers });
  }

  public submitVictimRestitutionApplication(victimRestitution: VictimRestitution) {
    return this.http.post(this.apiPath + 'submitvictimrestitution', victimRestitution, { headers: this.headers });
  }

  public submitOffenderRestitutionApplication(offenderRestitution: OffenderRestitution) {
    return this.http.post(this.apiPath + 'submitoffenderrestitution', offenderRestitution, { headers: this.headers });
  }

  public createPDF(htmlInput: String): Observable<any> {
    //htmlInput = "<html>Hello World</html>";
    return this.http.post(this.apiPath + 'getweasypdf', htmlInput, { headers: this.headers });
  }

  public getSampleCall() {
    return this.http.get<string>(this.apiPath + 'apitest', { headers: this.headers });
  }

  public getSampleData() {
    return this.http.get<string>(this.apiPath + 'getdata', { headers: this.headers });
  }

  public getDynamicsTest() {
    return this.http.get<string>(this.apiPath + 'dynamicstest', { headers: this.headers });
  }
}
