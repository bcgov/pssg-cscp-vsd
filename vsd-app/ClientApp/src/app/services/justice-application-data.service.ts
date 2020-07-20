import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Application } from '../interfaces/application.interface';
import { CounsellorInvoice } from '../interfaces/counsellor-invoice.interface';
import { VictimRestitution } from '../interfaces/victim-restitution.interface';
import { OffenderRestitution } from '../interfaces/offender-restitution.interface';
import { Observable } from 'rxjs';
import { Binary } from 'selenium-webdriver/firefox';

@Injectable()
export class JusticeApplicationDataService {
  apiPath = 'api/justice/';
  pdfHeaders: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json;charset=UTF-8',
    //  'Access-Control-Allow-Origin' : 'http://localhost:59451'
  });
  headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
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
    return this.http.post<any>(this.apiPath + 'getweasypdf', htmlInput, { headers: this.pdfHeaders });
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

  public validateVendor(vendorNumber, vendorPostalCode) {
    return this.http.get<string>(`${this.apiPath}validate_vendor/${vendorNumber}/${vendorPostalCode}`, { headers: this.headers });
  }
  public validateVendorAndCounsellor(vendorNumber, vendorPostalCode, counsellorNumber, counsellorLastName) {
    return this.http.get<string>(`${this.apiPath}validate_vendor_and_counsellor/${vendorNumber}/${vendorPostalCode}/${counsellorNumber}/${counsellorLastName}`, { headers: this.headers });
  }
}
