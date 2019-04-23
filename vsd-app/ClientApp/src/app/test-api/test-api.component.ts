import { Component, OnInit } from '@angular/core';
import { JusticeApplicationDataService } from '../services/justice-application-data.service';
import { FormBase } from '../shared/form-base';

@Component({
  selector: 'test-api',
  templateUrl: './test-api.component.html',
  styleUrls: ['./test-api.component.scss'],
  providers: [
  ],
})
export class TestApiComponent extends FormBase implements OnInit {
  dataLoaded = false;
  busy: Promise<any>;

  public apiResult: string;

  constructor(private justiceDataService: JusticeApplicationDataService) {
    super();
  }

  fireApiTest(): void {
    this.busy = this.justiceDataService
      .getSampleCall()
      .toPromise()
      .then(result => {
          console.log('From Data Call:', result);
        }
      );
  }

  fireDataTest(): void {
    this.busy = this.justiceDataService
      .getSampleData()
      .toPromise()
      .then(result => {
        this.apiResult = result;
        console.log('From Test Call:', result);
      }
    );
  }

  fireDynamicsTest(): void {
    this.busy = this.justiceDataService
      .getDynamicsTest()
      .toPromise()
      .then(result => {
        this.apiResult = result;
        console.log('From Dynamics Test:', result);
      }
    );
  }

  ngOnInit() {
  }
}
