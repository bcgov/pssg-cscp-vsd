import { Injectable } from '@angular/core';

import { DynamicsAccount } from '../models/dynamics-account.model';
import { DynamicsApplicationModel } from '../models/dynamics-application.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProfileValidation } from '../models/profile-validation.model';
import { Observable } from 'rxjs';

@Injectable()
export class JusticeApplicationDataService {

  apiPath = 'api/justice/';
  headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });
  
  constructor(private http: HttpClient) { }

  public submitApplication(applicationModel: DynamicsApplicationModel) {
    console.log('Firing submit call');
    return this.http.post(this.apiPath + 'saveapplication', applicationModel, { headers: this.headers });
  }

  public getSampleCall() {
    return this.http.get<string>(this.apiPath + 'apitest', { headers: this.headers });
  }

  public getSampleData() {
    return this.http.get<string>(this.apiPath + 'getdata', { headers: this.headers });
  }

  public updateAccount(accountModel: DynamicsAccount) {
    return this.http.put(this.apiPath + accountModel.id, accountModel, { headers: this.headers });
  }

  public deleteAccount(accountModel: DynamicsAccount) {
    return this.http.post(this.apiPath + accountModel.id + '/delete', accountModel, { headers: this.headers });
  }

}
