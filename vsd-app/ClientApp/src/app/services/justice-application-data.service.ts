import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Application } from '../interfaces/application.interface';
import { CounsellorInvoice } from '../interfaces/counsellor-invoice.interface';
import { environment } from 'src/environments/environment';

@Injectable()
export class JusticeApplicationDataService {
  baseUrl = environment.apiRootUrl;
  apiPath = this.baseUrl.concat('api/justice/');
  
  pdfHeaders: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json;charset=UTF-8',
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

  public submitRestitutionApplication(restitution: any) {
    return this.http.post(this.apiPath + 'submitrestitution', restitution, { headers: this.headers });
  }

  // public submitVictimRestitutionApplication(victimRestitution: VictimRestitution) {
  //   return this.http.post(this.apiPath + 'submitvictimrestitution', victimRestitution, { headers: this.headers });
  // }

  // public submitOffenderRestitutionApplication(offenderRestitution: OffenderRestitution) {
  //   return this.http.post(this.apiPath + 'submitoffenderrestitution', offenderRestitution, { headers: this.headers });
  // }

  public validateVendor(vendorNumber, vendorPostalCode) {
    return this.http.get<string>(`${this.apiPath}validate_vendor/${vendorNumber}/${vendorPostalCode}`, { headers: this.headers });
  }
  public validateVendorAndCounsellor(vendorNumber, vendorPostalCode, counsellorNumber, counsellorLastName) {
    return this.http.get<string>(`${this.apiPath}validate_vendor_and_counsellor/${vendorNumber}/${vendorPostalCode}/${counsellorNumber}/${counsellorLastName}`, { headers: this.headers });
  }
}
