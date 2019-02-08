import { Component, OnInit } from '@angular/core';
import { AppState } from '../app-state/models/app-state';
import { UserDataService } from '../services/user-data.service';
import { User } from '../models/user.model';
import { DynamicsContact } from '../models/dynamics-contact.model';
import * as CurrentUserActions from '../app-state/actions/current-user.action';
import { Store } from '@ngrx/store';
import { Subscription, Observable, Subject, forkJoin } from 'rxjs';
import { FormBuilder, FormGroup, Validators, FormArray, ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { defaultFormat as _rollupMoment } from 'moment';

import { AccountDataService } from '../services/account-data.service';
import { DynamicsAccount } from '../models/dynamics-account.model';
import { FormBase } from '../shared/form-base';

@Component({
  selector: 'test-api',
  templateUrl: './test-api.component.html',
  styleUrls: ['./test-api.component.scss'],
  providers: [
  ],
})
export class TestApiComponent extends FormBase implements OnInit {
  currentUser: User;
  dataLoaded = false;
  busy: Promise<any>;
  busy2: Promise<any>;
  busy3: Promise<any>;
  form: FormGroup;

  public apiResult: Observable<string>;

  constructor(private userDataService: UserDataService,
    private store: Store<AppState>,
    private accountDataService: AccountDataService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,

  ) {
    super();
  }

  fireApiTest(): void {
    console.log('Firing form');

    this.busy = this.accountDataService.getSampleCall().toPromise();
    
    console.log('Button hit');
  }

  ngOnInit() {
    this.form = this.fb.group({
      introduction: this.fb.group({
        understoodInformation: ['', Validators.required],
      }),
    });
  }
}
