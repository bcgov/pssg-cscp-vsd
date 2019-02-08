import { Injectable } from '@angular/core';

import { DynamicsAccount } from '../models/dynamics-account.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProfileValidation } from '../models/profile-validation.model';
import { Observable } from 'rxjs';

@Injectable()
export class TestDataService {

  apiPath = 'api/test/';
  headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });


  constructor(private http: HttpClient) { }

  public getSendTest() {
    return this.http.get(this.apiPath + 'apitest', { headers: this.headers });
  }
}
