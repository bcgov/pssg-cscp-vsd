import { Component, OnInit } from '@angular/core';
import { User } from '../models/user.model';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators, FormArray, ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { defaultFormat as _rollupMoment } from 'moment';
import { CanDeactivateGuard } from '../services/can-deactivate-guard.service';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SignPadDialog } from '../sign-dialog/sign-dialog.component';
import { SummaryOfBenefitsDialog } from '../summary-of-benefits/summary-of-benefits.component';
import { DeactivateGuardDialog } from '../shared/guard-dialog/guard-dialog.component';
import { CancelApplicationDialog } from '../shared/cancel-dialog/cancel-dialog.component';
import { JusticeApplicationDataService } from '../services/justice-application-data.service';
import { DynamicsApplicationModel } from '../models/dynamics-application.model';
import { FormBase } from '../shared/form-base';
import { HOSPITALS } from '../shared/hospital-list';
import { EnumHelper } from '../shared/enums-list';

const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'YYYY-MM-DD',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export const postalRegex = '(^\\d{5}([\-]\\d{4})?$)|(^[A-Za-z][0-9][A-Za-z]\\s?[0-9][A-Za-z][0-9]$)';

@Component({
  selector: 'app-victim-restitution',
  templateUrl: './victim-restitution.component.html',
  styleUrls: ['./victim-restitution.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})

export class VictimRestitutionComponent extends FormBase implements OnInit, CanDeactivateGuard {
  currentUser: User;
  dataLoaded = false;
  busy: Promise<any>;
  busy2: Promise<any>;
  busy3: Promise<any>;
  form: FormGroup;
  formFullyValidated: boolean;
  showValidationMessage: boolean;

  courtFileItems: FormArray;

  enumHelper = new EnumHelper();

  showAddCourtInfo: boolean = true;
  showRemoveCourtInfo: boolean = false;

  public currentFormStep: number;

  phoneIsRequired: boolean = false;
  emailIsRequired: boolean = false;
  addressIsRequired: boolean = false;

  saveFormData: any;

  constructor(
    private justiceDataService: JusticeApplicationDataService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    super();

    this.formFullyValidated = false;
    this.currentFormStep = 0;
  }

  canDeactivate() {
    let formDirty = false;

    formDirty = this.form.dirty && this.form.touched;
    console.log('Form Dirty: ' + formDirty);

    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(DeactivateGuardDialog, dialogConfig);
    dialogRef.afterClosed().subscribe(
      data => {
        console.log(data); 
        return data;
      }
    ); 

    //return verifyDialogRef.navigateAwaySelection$;
    // if the editName !== this.user.name
    //    if (this.user.name !== this.editName) {
    //return window.confirm('Discard changes?');
    //}

    return false;
  }

  ngOnInit() {
    this.form = this.buildApplicationForm();

    this.form.get('restitutionInformation.preferredMethodOfContact')
      .valueChanges
      .subscribe(value => {
        let phoneControl = this.form.get('restitutionInformation.phoneNumber');
        let emailControl = this.form.get('restitutionInformation.email');
        let addressControl = this.form.get('restitutionInformation').get('mailingAddress.line1');
        let addressControls = [
          this.form.get('restitutionInformation').get('mailingAddress.country'),
          this.form.get('restitutionInformation').get('mailingAddress.province'),
          this.form.get('restitutionInformation').get('mailingAddress.city'),
          this.form.get('restitutionInformation').get('mailingAddress.line1'),
          this.form.get('restitutionInformation').get('mailingAddress.postalCode'),
        ];

        phoneControl.clearValidators();
        phoneControl.setErrors(null);
        emailControl.clearValidators();
        emailControl.setErrors(null);
        addressControl.clearValidators();
        addressControl.setErrors(null);
        for (let control of addressControls) {
          control.clearValidators();
          control.setErrors(null);
        }

        let contactMethod = parseInt(value);
        if (contactMethod === 100000000) {
          phoneControl.setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(10)]);
          this.phoneIsRequired = true;
          this.emailIsRequired = false;
          this.addressIsRequired = false;
        } else if (contactMethod === 100000001) {
          this.phoneIsRequired = false;
          this.emailIsRequired = true;
          this.addressIsRequired = false;
        } else if (contactMethod === 100000002) {
          addressControl.setValidators([Validators.required]);
          for (let control of addressControls) {
            control.setValidators([Validators.required]);
          }
          this.phoneIsRequired = false;
          this.emailIsRequired = false;
          this.addressIsRequired = true;
        }

        phoneControl.markAsTouched();
        phoneControl.updateValueAndValidity();
        emailControl.markAsTouched();
        emailControl.updateValueAndValidity();
        addressControl.markAsTouched();
        addressControl.updateValueAndValidity();
        for (let control of addressControls) {
          control.markAsTouched();
          control.updateValueAndValidity();
        }
      });
    
    this.form.get('restitutionInformation.authoriseVictimDesignate')
      .valueChanges
      .subscribe(value => {
        let firstName = this.form.get('restitutionInformation.authorisedDesignateFirstName');
        let lastName = this.form.get('restitutionInformation.authorisedDesignateLastName');

        firstName.clearValidators();
        firstName.setErrors(null);
        lastName.clearValidators();
        lastName.setErrors(null);

        let useValidation = value === true;
        if (useValidation) {
          firstName.setValidators([Validators.required]);
          lastName.setValidators([Validators.required]);
        }
      });

  }
  
  showSignPad(group, control): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(SignPadDialog, dialogConfig);
    dialogRef.afterClosed().subscribe(
      data => {
        var patchObject = {};
        patchObject[control] = data;
        this.form.get(group).patchValue(
          patchObject
        );
      }
    ); 
  }

  verifyCancellation(): void {
    const verifyDialogConfig = new MatDialogConfig();
    verifyDialogConfig.disableClose = true;
    verifyDialogConfig.autoFocus = true;
    verifyDialogConfig.data = 'witness';

    const verifyDialogRef = this.dialog.open(CancelApplicationDialog, verifyDialogConfig);
  }

  showSummaryOfBenefits(): void {
    const summaryDialogRef = this.dialog.open(SummaryOfBenefitsDialog, { maxWidth: '800px !important', data: 'victim' });
  }

  getFormGroupName(groupIndex: any) {
    let elements: Array<string> = ['introduction', 'restitutionInformation'];
    return elements[groupIndex];
  }

  gotoPageIndex(stepper: MatStepper, selectPage: number): void {
    window.scroll(0, 0);
    stepper.selectedIndex = selectPage;
    this.currentFormStep = selectPage;
  }

  gotoPage(selectPage: MatStepper): void {
    window.scroll(0, 0);
    this.showValidationMessage = false;
    this.currentFormStep = selectPage.selectedIndex;
  }

  gotoNextStep(stepper: MatStepper): void {
//    console.log(this.currentFormStep);
    if (stepper != null) {
      var desiredFormIndex = stepper.selectedIndex;
      var formGroupName = this.getFormGroupName(desiredFormIndex);

      this.formFullyValidated = this.form.valid;

      if (desiredFormIndex >= 0 && desiredFormIndex < 9) {
        var formParts = this.form.get(formGroupName);
        var formValid = true;

        if (formParts != null) {
          formValid = formParts.valid;
        }

        if (formValid) {
          this.showValidationMessage = false;
          window.scroll(0, 0);
          stepper.next();
        } else {
          this.validateAllFormFields(formParts);
          this.showValidationMessage = true;
        }
      }
    }
  }

  addCourtInfo(): void {
    this.courtFileItems = this.form.get('restitutionInformation.courtFiles') as FormArray;
    this.courtFileItems.push(this.createCourtInfoItem());
    this.showAddCourtInfo = this.courtFileItems.length < 3;
    this.showRemoveCourtInfo = this.courtFileItems.length > 1;
  }

  removeCourtInfo(index: number): void {
    this.courtFileItems = this.form.get('restitutionInformation.courtFiles') as FormArray;
    this.courtFileItems.removeAt(index);
    this.showAddCourtInfo = this.courtFileItems.length < 3;
    this.showRemoveCourtInfo = this.courtFileItems.length > 1;
  }

  createCourtInfoItem(): FormGroup {
    return this.fb.group({
      courtFileNumber: '',
      courtLocation: ''
    });
  }

  submitPartialApplication() {
      this.formFullyValidated = true;
      this.save().subscribe(
      data => {
        console.log("submitting partial form");
        this.router.navigate(['/application-success']);
      },
      err => {
        this.snackBar.open('Error submitting application', 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
        console.log('Error submitting application');
      }
    );
  }
  
  submitApplication() {
    let formIsValid = this.form.valid;
    //let formIsValid = true;
    if (formIsValid) {
      this.formFullyValidated = true;
      this.save().subscribe(
        data => {
          if (data['IsSuccess'] == true) {
            this.router.navigate(['/application-success']);
          }
          else {
            this.snackBar.open('Error submitting application', 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
            console.log('Error submitting application');
          }
        },
        error => {
          this.snackBar.open('Error submitting application', 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
          console.log('Error submitting application');
        }
      );
    } else {
      console.log("form not validated");
      this.formFullyValidated = false;
      this.markAsTouched();
    }
  }

  debugFormData(): void {
    let formData = <DynamicsApplicationModel> {
      RestitutionInformation: this.form.get('restitutionInformation').value,
    };
    //console.log(formData);
    console.log(JSON.stringify(formData));
  }

  save(): Subject<boolean> {
    const subResult = new Subject<boolean>();
    const formData = <DynamicsApplicationModel>{
      RestitutionInformation: this.form.get('restitutionInformation').value,
    };

    this.busy = this.justiceDataService.submitApplication(formData)
        .toPromise()
        .then(res => {
          subResult.next(true);
        }, err => subResult.next(false));
    this.busy2 = Promise.resolve(this.busy);

    return subResult;
  }

  // marking the form as touched makes the validation messages show
  markAsTouched() {
    this.form.markAsTouched();
  }

  private buildApplicationForm() : FormGroup {
    return this.fb.group({
      introduction: this.fb.group({
      }),
      restitutionInformation: this.fb.group({
        victimFirstName: ['', Validators.required],
        victimMiddleName: [''],
        victimLastName: ['', Validators.required],
        victimGender: [0, [Validators.required, Validators.min(100000000), Validators.max(100000002)]],
        victimBirthDate: ['', [Validators.required]],

        authoriseVictimDesignate: ['', Validators.required],
        authorisedDesignateFirstName: [''],
        authorisedDesignateMiddleName: [''],
        authorisedDesignateLastName: [''],

        authoriseDesignateToActOnBehalf: [''],

        preferredMethodOfContact: [0, [Validators.required, Validators.min(100000000)]], // Phone = 100000000, Email = 100000001, Mail = 100000002

        phoneNumber: [''],
        alternatePhoneNumber: [''],
        email: [''],

        mailingAddress: this.fb.group({
          line1: ['', Validators.required],
          line2: [''],
          city: ['', Validators.required],
          postalCode: ['', [Validators.pattern(postalRegex), Validators.required]],
          province: [{ value: 'British Columbia', disabled: false }],
          country: [{ value: 'Canada', disabled: false }],
        }),

        permissionToLeaveDetailedMessage: [''],

        offenderFirstName: [''],
        offenderMiddleName: [''],
        offenderLastName: [''],
        offenderRelationship: [''],
        courtFiles: this.fb.array([this.createCourtInfoItem()]),

        victimServiceWorkerFirstName: [''],
        victimServiceWorkerLastName: [''],
        victimServiceWorkerProgramName: [''],
        victimServiceWorkerEmail: [''],

        restitutionOrders: this.fb.array([]),  // This will be a collection of uploaded files

        declaredAndSigned: ['', Validators.requiredTrue],
        signature: ['', Validators.required],
      })
    });
  }
}
