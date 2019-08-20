import { Injectable } from '@angular/core';
import { DynamicsApplicationModel } from '../models/dynamics-application.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApplicationForm } from '../interfaces/application-form.interface';
import { CounsellorInvoice } from '../interfaces/counsellor-invoice.interface';
import { VictimRestitution } from '../interfaces/victim-restitution.interface';

@Injectable()
export class JusticeApplicationDataService {
  apiPath = 'api/justice/';
  headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) { }

  public submitApplication(applicationForm: ApplicationForm) {
    return this.http.post(this.apiPath + 'saveapplication', applicationForm, { headers: this.headers });
  }

  public submitCounsellorInvoice(counsellorInvoice: CounsellorInvoice) {
    return this.http.post(this.apiPath + 'submitcounsellorinvoice', counsellorInvoice, { headers: this.headers });
  }

  public submitVictimRestitutionApplication(victimModel: VictimRestitution) {
    return this.http.post(this.apiPath + 'submitvictimrestitution', victimModel, { headers: this.headers });
  }

  public submitOffenderRestitutionApplication(offenderModel: DynamicsApplicationModel) {
    return this.http.post(this.apiPath + 'submitoffenderrestitution', offenderModel, { headers: this.headers });
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
