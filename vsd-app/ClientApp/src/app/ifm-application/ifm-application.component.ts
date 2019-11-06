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
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';

import { SignPadDialog } from '../sign-dialog/sign-dialog.component';
import { SummaryOfBenefitsDialog } from '../summary-of-benefits/summary-of-benefits.component';
import { CancelApplicationDialog } from '../shared/cancel-dialog/cancel-dialog.component';
import { JusticeApplicationDataService } from '../services/justice-application-data.service';
import { FormBase } from '../shared/form-base';
import { HOSPITALS } from '../shared/hospital-list';
import { EnumHelper } from '../shared/enums-list';
import { MY_FORMATS } from '../shared/enums-list';
import { Application, Introduction, PersonalInformation, CrimeInformation, MedicalInformation, ExpenseInformation, EmploymentIncomeInformation, RepresentativeInformation, DeclarationInformation, AuthorizationInformation } from '../interfaces/application.interface';
import { FileBundle } from '../models/file-bundle';

const moment = _rollupMoment || _moment;

export const postalRegex = '(^\\d{5}([\-]\\d{4})?$)|(^[A-Za-z][0-9][A-Za-z]\\s?[0-9][A-Za-z][0-9]$)';

@Component({
  selector: 'app-ifm-application',
  templateUrl: './ifm-application.component.html',
  styleUrls: ['./ifm-application.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})

export class IfmApplicationComponent extends FormBase implements OnInit {
  currentUser: User;
  dataLoaded = false;
  busy: Promise<any>;
  busy2: Promise<any>;
  busy3: Promise<any>;
  form: FormGroup;
  formFullyValidated: boolean;
  showValidationMessage: boolean;
  submitting: boolean = false; // this controls the button state for

  otherTreatmentItems: FormArray;
  employerItems: FormArray;
  courtFileItems: FormArray;
  crimeLocationItems: FormArray;
  policeReportItems: FormArray;

  hospitalList = HOSPITALS;
  enumHelper = new EnumHelper();

  showAddCourtInfo: boolean = true;
  showRemoveCourtInfo: boolean = false;
  showAddCrimeLocation: boolean = true;
  showRemoveCrimeLocation: boolean = false;
  showAddPoliceReport: boolean = true;
  showRemovePoliceReport: boolean = false;
  showAddProvider: boolean = true;
  showRemoveProvider: boolean = false;

  public currentFormStep: number;

  phoneIsRequired: boolean = false;
  emailIsRequired: boolean = false;
  addressIsRequired: boolean = false;

  representativePhoneIsRequired: boolean = false;
  representativeEmailIsRequired: boolean = false;
  representativeAddressIsRequired: boolean = false;

  saveFormData: any;

  todaysDate = new Date(); // for the birthdate validation
  oldestHuman = new Date(this.todaysDate.getFullYear() - 120, this.todaysDate.getMonth(), this.todaysDate.getDay());

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

  ngOnInit() {
    let completeOnBehalfOf = this.route.snapshot.queryParamMap.get('ob');
    this.form = this.buildApplicationForm();

    this.form.get('representativeInformation').patchValue({
      completingOnBehalfOf: parseInt(completeOnBehalfOf)
    });

    this.form.get('personalInformation.preferredMethodOfContact')
      .valueChanges
      .subscribe(value => {
        let phoneControl = this.form.get('personalInformation.phoneNumber');
        let emailControl = this.form.get('personalInformation.email');
        let emailConfirmControl = this.form.get('personalInformation.confirmEmail');
        let addressControl = this.form.get('personalInformation').get('primaryAddress.line1');
        let addressControls = [
          this.form.get('personalInformation').get('primaryAddress.country'),
          this.form.get('personalInformation').get('primaryAddress.province'),
          this.form.get('personalInformation').get('primaryAddress.city'),
          this.form.get('personalInformation').get('primaryAddress.line1'),
          this.form.get('personalInformation').get('primaryAddress.postalCode'),
        ];

        phoneControl.clearValidators();
        phoneControl.setErrors(null);
        emailControl.clearValidators();
        emailControl.setErrors(null);
        emailConfirmControl.clearValidators();
        emailConfirmControl.setErrors(null);
        addressControl.clearValidators();
        addressControl.setErrors(null);
        for (let control of addressControls) {
          control.clearValidators();
          control.setErrors(null);
        }

        let contactMethod = parseInt(value);
        if (contactMethod === 2) {
          phoneControl.setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(10)]);
          this.phoneIsRequired = true;
          this.emailIsRequired = false;
          this.addressIsRequired = false;
        } else if (contactMethod === 1) {
          emailControl.setValidators([Validators.required, Validators.email]); // need to add validator to check these two are the same
          emailConfirmControl.setValidators([Validators.required, Validators.email]); // need to add validator to check these two are the same
          this.phoneIsRequired = false;
          this.emailIsRequired = true;
          this.addressIsRequired = false;
        } else if (contactMethod === 4) {
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
        emailConfirmControl.markAsTouched();
        emailConfirmControl.updateValueAndValidity();
        addressControl.markAsTouched();
        addressControl.updateValueAndValidity();
        for (let control of addressControls) {
          control.markAsTouched();
          control.updateValueAndValidity();
        }
      });

    this.form.get('medicalInformation.wereYouTreatedAtHospital')
      .valueChanges
      .subscribe(value => {
        let hospitalControl = this.form.get('medicalInformation.treatedAtHospitalName');

        hospitalControl.clearValidators();
        hospitalControl.setErrors(null);

        let useValidation = value === true;
        if (useValidation) {
          hospitalControl.setValidators([Validators.required]);
        }
      });

    this.form.get('victimInformation.mostRecentMailingAddressSameAsPersonal').valueChanges
      .subscribe(value => {
        this.copyPersonalAddressToVictimAddress();
      });

    this.form.get('personalInformation.primaryAddress').valueChanges
      .subscribe(value => {
        this.copyPersonalAddressToVictimAddress();
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
    verifyDialogRef.afterClosed().subscribe(
      data => {
        if (data === true) {
          this.router.navigate(['/application-cancelled']);
          return;
        }
      }
    );
  }

  showSummaryOfBenefits(): void {
    const summaryDialogRef = this.dialog.open(SummaryOfBenefitsDialog, { maxWidth: '800px !important', data: 'ifm' });
  }

  getFormGroupName(groupIndex: any) {
    let elements: Array<string> = ['introduction', 'personalInformation', 'victimInformation', 'crimeInformation', 'medicalInformation', 'expenseInformation', 'representativeInformation', 'declarationInformation', 'authorizationInformation'];
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

  addProvider(): void {
    this.otherTreatmentItems = this.form.get('medicalInformation.otherTreatments') as FormArray;
    this.otherTreatmentItems.push(this.createTreatmentItem());
    this.showAddProvider = this.otherTreatmentItems.length < 5;
    this.showRemoveProvider = this.otherTreatmentItems.length > 1;
  }
  clearProviders(): void {
    // remove all providers
    this.otherTreatmentItems = this.form.get('medicalInformation.otherTreatments') as FormArray;
    while (this.otherTreatmentItems.length > 0) {
      this.otherTreatmentItems.removeAt(this.otherTreatmentItems.length - 1);
    }
  }

  removeProvider(index: number): void {
    this.otherTreatmentItems = this.form.get('medicalInformation.otherTreatments') as FormArray;
    this.otherTreatmentItems.removeAt(index);
    this.showAddProvider = this.otherTreatmentItems.length < 5;
    this.showRemoveProvider = this.otherTreatmentItems.length > 1;
  }

  createTreatmentItem(): FormGroup {
    return this.fb.group({
      providerType: [0],   // 100000001 = Specialist, 100000002 = Counsellor/Psychologist, 100000003 = Dentist, 100000004 = Other
      providerName: ['', Validators.required],
      providerPhoneNumber: [''],
      providerAddress: this.fb.group({
        line1: [''],
        line2: [''],
        city: [''],
        postalCode: [''],  // , [Validators.pattern(postalRegex)]
        province: [{ value: 'British Columbia', disabled: false }],
        country: [{ value: 'Canada', disabled: false }],
      }),
    });
  }

  createEmployerItem(): FormGroup {
    return this.fb.group({
      employerName: [''],//, Validators.required],
      employerPhoneNumber: [''],//, Validators.required],
      employerFirstName: [''],
      employerLastName: [''],
      employerAddress: this.fb.group({
        line1: [''],
        line2: [''],
        city: [''],
        postalCode: [''],  // , [Validators.pattern(postalRegex)]
        province: [{ value: 'British Columbia', disabled: false }],
        country: [{ value: 'Canada', disabled: false }],
      })
    });
  }

  addCourtInfo(): void {
    this.courtFileItems = this.form.get('crimeInformation.courtFiles') as FormArray;
    this.courtFileItems.push(this.createCourtInfoItem());
    this.showAddCourtInfo = this.courtFileItems.length < 3;
    this.showRemoveCourtInfo = this.courtFileItems.length > 1;
  }

  removeCourtInfo(index: number): void {
    this.courtFileItems = this.form.get('crimeInformation.courtFiles') as FormArray;
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

  addCrimeLocation(): void {
    this.crimeLocationItems = this.form.get('crimeInformation.crimeLocations') as FormArray;
    this.crimeLocationItems.push(this.createCrimeLocationItem());
    this.showAddCrimeLocation = this.crimeLocationItems.length < 5;
    this.showRemoveCrimeLocation = this.crimeLocationItems.length > 1;
  }

  removeCrimeLocation(index: number): void {
    this.crimeLocationItems = this.form.get('crimeInformation.crimeLocations') as FormArray;
    this.crimeLocationItems.removeAt(index);
    this.showAddCrimeLocation = this.crimeLocationItems.length < 5;
    this.showRemoveCrimeLocation = this.crimeLocationItems.length > 1;
  }

  createCrimeLocationItem(): FormGroup {
    return this.fb.group({
      location: ['', Validators.required]
    });
  }

  addPoliceReport(): void {
    this.policeReportItems = this.form.get('crimeInformation.policeReports') as FormArray;
    this.policeReportItems.push(this.createPoliceReport());
    this.showAddPoliceReport = this.policeReportItems.length < 5;
    this.showRemovePoliceReport = this.policeReportItems.length > 1;
  }

  removePoliceReport(index: number): void {
    this.policeReportItems = this.form.get('crimeInformation.policeReports') as FormArray;
    this.policeReportItems.removeAt(index);
    this.showAddPoliceReport = this.policeReportItems.length < 5;
    this.showRemovePoliceReport = this.policeReportItems.length > 1;
  }

  createPoliceReport(): FormGroup {
    return this.fb.group({
      policeFileNumber: '',
      investigatingOfficer: ''
    });
  }

  submitPartialApplication() {
    this.justiceDataService.submitApplication(this.harvestForm())
      .subscribe(
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

  //submitPartialApplication() {
  //  this.formFullyValidated = true;
  //  this.save().subscribe(
  //    data => {
  //      console.log("submitting partial form");
  //      this.router.navigate(['/application-success']);
  //    },
  //    err => {
  //      this.snackBar.open('Error submitting application', 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
  //      console.log('Error submitting application');
  //    }
  //  );
  //}

  submitApplication() {
    //let formIsValid = true;showValidationMessage
    // show the button as submitting and disable it
    this.submitting = true;
    if (this.form.valid) {
      this.justiceDataService.submitApplication(this.harvestForm())
        .subscribe(
          data => {
            if (data['isSuccess'] == true) {
              this.router.navigate(['/application-success']);
            }
            else {
              // re-enable the button
              this.submitting = false;
              this.snackBar.open('Error submitting application', 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
              console.log('Error submitting application');
            }
          },
          error => {
            // re-enable the button
            this.submitting = false;
            this.snackBar.open('Error submitting application', 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
            console.log('Error submitting application');
          }
        );
    } else {
      // re-enable the button
      this.submitting = false;
      console.log("form not validated");
      this.markAsTouched();
    }
  }

  //submitApplication() {
  //  let formIsValid = this.form.valid;
  //  //let formIsValid = true;
  //  if (formIsValid) {
  //    this.formFullyValidated = true;
  //    this.save().subscribe(
  //      data => {
  //        if (data['IsSuccess'] == true) {
  //          console.log(data['IsSuccess']);
  //          console.log("submitting");
  //          this.router.navigate(['/application-success']);
  //        }
  //        else {
  //          this.snackBar.open('Error submitting application', 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
  //          console.log('Error submitting application');
  //        }
  //      },
  //      error => {
  //        this.snackBar.open('Error submitting application', 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
  //        console.log('Error submitting application');
  //      }
  //    );
  //  } else {
  //    console.log("form not validated");
  //    this.formFullyValidated = false;
  //    this.markAsTouched();
  //  }
  //}

  debugFormData(): void {
    let formData: Application = {
      Introduction: this.form.get('introduction').value,
      PersonalInformation: this.form.get('personalInformation').value,
      VictimInformation: this.form.get('victimInformation').value,
      CrimeInformation: this.form.get('crimeInformation').value,
      MedicalInformation: this.form.get('medicalInformation').value,
      ExpenseInformation: this.form.get('expenseInformation').value,
      EmploymentIncomeInformation: null,
      RepresentativeInformation: this.form.get('representativeInformation').value,
      DeclarationInformation: this.form.get('declarationInformation').value,
      AuthorizationInformation: this.form.get('authorizationInformation').value,
    };
    //console.log(formData);
    console.log(JSON.stringify(formData));
  }

  harvestForm(): Application {
    return {
      Introduction: this.form.get('introduction').value as Introduction,
      PersonalInformation: this.form.get('personalInformation').value as PersonalInformation,
      CrimeInformation: this.form.get('crimeInformation').value as CrimeInformation,
      MedicalInformation: this.form.get('medicalInformation').value as MedicalInformation,
      ExpenseInformation: this.form.get('expenseInformation').value as ExpenseInformation,
      EmploymentIncomeInformation: null as EmploymentIncomeInformation, // There is no EmploymentIncomeInformation in IFM
      RepresentativeInformation: this.form.get('representativeInformation').value as RepresentativeInformation,
      DeclarationInformation: this.form.get('declarationInformation').value as DeclarationInformation,
      AuthorizationInformation: this.form.get('authorizationInformation').value as AuthorizationInformation,
    } as Application;
  }

  save(): void {
    this.justiceDataService.submitApplication(this.harvestForm())
      .subscribe(
        data => { },
        err => { }
      );
  }

  //save(): Subject<boolean> {
  //  const subResult = new Subject<boolean>();
  //  const formData: Application = {
  //    Introduction: this.form.get('introduction').value,
  //    PersonalInformation: this.form.get('personalInformation').value,
  //    VictimInformation: this.form.get('victimInformation').value,
  //    CrimeInformation: this.form.get('crimeInformation').value,
  //    MedicalInformation: this.form.get('medicalInformation').value,
  //    ExpenseInformation: this.form.get('expenseInformation').value,
  //    RepresentativeInformation: this.form.get('representativeInformation').value,
  //    DeclarationInformation: this.form.get('declarationInformation').value,
  //    AuthorizationInformation: this.form.get('authorizationInformation').value,
  //  };

  //  this.busy = this.justiceDataService.submitApplication(formData)
  //    .toPromise()
  //    .then(res => {
  //      subResult.next(true);
  //    }, err => subResult.next(false));
  //  this.busy2 = Promise.resolve(this.busy);

  //  return subResult;
  //}

  // marking the form as touched makes the validation messages show
  markAsTouched() {
    this.form.markAsTouched();
  }

  private buildApplicationForm(): FormGroup {
    return this.fb.group({
      introduction: this.fb.group({
        understoodInformation: ['', Validators.requiredTrue]
      }),
      personalInformation: this.fb.group({
        firstName: ['', Validators.required],
        middleName: [''],
        lastName: ['', Validators.required],

        iHaveOtherNames: [''],
        otherFirstName: [''],
        otherLastName: [''],
        dateOfNameChange: [''],

        gender: [0, [Validators.required, Validators.min(100000000), Validators.max(100000002)]],
        relationshipToVictim: [0, [Validators.required, Validators.min(100000000), Validators.max(100000004)]],
        relationshipToVictimOther: [''],

        birthDate: ['', [Validators.required]],

        sin: ['', [Validators.minLength(9), Validators.maxLength(9)]], // needs refinement
        occupation: [''],

        preferredMethodOfContact: [0, [Validators.required, Validators.min(1), Validators.max(4)]],  // Phone = 2, Email = 1, Mail = 4

        permissionToContactViaMethod: [false],
        agreeToCvapCommunicationExchange: [''],

        phoneNumber: [''],
        alternatePhoneNumber: [''],
        email: [''],
        confirmEmail: [''],

        primaryAddress: this.fb.group({
          line1: ['', Validators.required],
          line2: [''],
          city: ['', Validators.required],
          postalCode: ['', [Validators.pattern(postalRegex), Validators.required]],
          province: [{ value: 'British Columbia', disabled: false }],
          country: [{ value: 'Canada', disabled: false }],
        }),
        alternateAddress: this.fb.group({
          line1: [''],
          line2: [''],
          city: [''],
          postalCode: [''],
          province: [{ value: 'British Columbia', disabled: false }],
          country: [{ value: 'Canada', disabled: false }],
        }),
      }),
      victimInformation: this.fb.group({
        firstName: ['', Validators.required],
        middleName: [''],
        lastName: ['', Validators.required],

        iHaveOtherNames: [''],
        otherFirstName: [''],
        otherLastName: [''],
        dateOfNameChange: [''],

        gender: [0, [Validators.required, Validators.min(100000000), Validators.max(100000002)]],
        birthDate: ['', [Validators.required]],
        maritalStatus: [0, [Validators.required, Validators.min(100000000), Validators.max(100000006)]],
        sin: ['', [Validators.minLength(9), Validators.maxLength(9)]], // needs refinement
        occupation: [''],

        phoneNumber: [''],
        alternatePhoneNumber: [''],
        email: [''],
        confirmEmail: [''],

        // Bind a subscribe event on this field being true. Change victim primary address when applicant address changes
        mostRecentMailingAddressSameAsPersonal: ['', Validators.required],

        primaryAddress: this.fb.group({
          line1: [''],//, Validators.required],
          line2: [''],
          city: [''],//, Validators.required],
          postalCode: ['', [Validators.pattern(postalRegex)]],//, Validators.required]],
          province: [{ value: 'British Columbia', disabled: false }],
          country: [{ value: 'Canada', disabled: false }],
        }),
      }),
      crimeInformation: this.fb.group({
        typeOfCrime: ['', Validators.required],

        unsureOfCrimeDates: [''],
        whenDidCrimeOccur: [''],  // True = Period of Time, False = Start date only
        crimePeriodStart: ['', Validators.required],
        crimePeriodEnd: [''],
        applicationFiledWithinOneYearFromCrime: [''],
        whyDidYouNotApplySooner: [''],

        victimDeceasedFromCrime: ['', Validators.required],
        dateOfDeath: [''],

        crimeLocation: [''],  // REMOVE AFTER DEMO
        crimeLocations: this.fb.array([this.createCrimeLocationItem()]),
        crimeDetails: ['', Validators.required],
        crimeInjuries: ['', Validators.required],
        additionalInformationFiles: this.fb.group({//[this.createAdditionalInformationFiles()]),
          filename: [''], // fileName
          body: [''], // fileData
        }), // This will be a collection of uploaded files
        //additionalInformationFiles: this.fb.array([]),

        wasReportMadeToPolice: [0, [Validators.required, Validators.min(100000000), Validators.max(100000001)]], // No: 100000000 Yes: 100000001

        policeReportedWhichPoliceForce: [''],
        policeReportedMultipleTimes: [''],
        policeReportedDate: [''],
        policeReportedEndDate: [''],
        policeReports: this.fb.array([this.createPoliceReport()]),

        noPoliceReportIdentification: [''],

        offenderFirstName: [''],
        offenderMiddleName: [''],
        offenderLastName: [''],
        offenderRelationship: [''],
        offenderBeenCharged: [0, [Validators.required, Validators.min(100000000), Validators.max(100000002)]],  // Yes: 100000000 No: 100000001 Undecided: 100000002

        courtFiles: this.fb.array([this.createCourtInfoItem()]),

        haveYouSuedOffender: [0, [Validators.required, Validators.min(100000000), Validators.max(100000001)]], // No: 100000000   Yes: 100000001
        intendToSueOffender: [0], // Yes: 100000000 No: 100000001 Undecided: 100000002

        racafInformation: this.fb.group({
          applyToCourtForMoneyFromOffender: [''],
          expensesRequested: [''],
          expensesAwarded: [''],
          expensesReceived: [''],
          willBeTakingLegalAction: [''],
          lawyerOrFirmName: [''],
          lawyerAddress: this.fb.group({
            line1: [''],
            line2: [''],
            city: [''],
            postalCode: [''],  // , [Validators.pattern(postalRegex)]
            province: [{ value: 'British Columbia', disabled: false }],
            country: [{ value: 'Canada', disabled: false }],
          }),
          signName: [''],
          signature: [''],
        }),
      }),
      medicalInformation: this.fb.group({
        doYouHaveMedicalServicesCoverage: ['', Validators.required],
        personalHealthNumber: [''],

        doYouHaveOtherHealthCoverage: ['', Validators.required],
        otherHealthCoverageProviderName: [''],
        otherHealthCoverageExtendedPlanNumber: [''],

        wereYouTreatedAtHospital: ['', Validators.required],
        treatedAtHospitalName: [''],
        treatedOutsideBc: [''],
        treatedOutsideBcHospitalName: [''],
        treatedAtHospitalDate: [''],

        beingTreatedByFamilyDoctor: ['', Validators.required],
        familyDoctorName: [''],
        familyDoctorPhoneNumber: [''],
        familyDoctorAddressLine1: [''],
        familyDoctorAddressLine2: [''],

        hadOtherTreatments: ['', Validators.required],
        otherTreatments: this.fb.array([this.createTreatmentItem()]),
      }),
      expenseInformation: this.fb.group({
        haveCounsellingExpenses: [false],
        haveCounsellingTransportation: [false],
        havePrescriptionDrugExpenses: [false],

        // Additional Expenses
        haveVocationalServicesExpenses: [false],
        haveIncomeSupportExpenses: [false],
        haveChildcareExpenses: [false],
        haveLegalProceedingExpenses: [false],
        haveFuneralExpenses: [false],
        haveBereavementLeaveExpenses: [false],
        haveLostOfParentalGuidanceExpenses: [false],
        haveHomeMakerExpenses: [false],
        haveCrimeSceneCleaningExpenses: [false],
        noneOfTheAboveExpenses: [''],

        missedWorkDueToDeathOfVictim: [''],//, Validators.required],

        didYouLoseWages: [''], //, Validators.required],
        daysWorkMissedStart: [''], //, Validators.required],
        daysWorkMissedEnd: [''],

        employers: this.fb.array([this.createEmployerItem()]),
        mayContactEmployer: [''],

        // Other Benefits
        haveDisabilityPlanBenefits: [false],
        haveEmploymentInsuranceBenefits: [false],
        haveIncomeAssistanceBenefits: [false],
        haveCanadaPensionPlanBenefits: [false],
        haveAboriginalAffairsAndNorthernDevelopmentCanadaBenefits: [false],
        haveCivilActionBenefits: [false],
        haveOtherBenefits: [false],
        otherSpecificBenefits: [''],
        noneOfTheAboveBenefits: [false],
      }),

      representativeInformation: this.fb.group({
        completingOnBehalfOf: [0, [Validators.required, Validators.min(100000000), Validators.max(100000003)]], // Self: 100000000  Victim Service Worker: 100000001  Parent/Guardian: 100000002,
        representativeFirstName: [''], //, Validators.required],
        representativeMiddleName: [''],
        representativeLastName: [''], //, Validators.required],
        representativePreferredMethodOfContact: [0],   // Phone = 100000000, Email = 100000001, Mail = 100000002
        representativePhoneNumber: [''],
        representativeAlternatePhoneNumber: [''],
        representativeEmail: [''], //, [Validators.required, Validators.email]],
        representativeAddress: this.fb.group({
          line1: [''],
          line2: [''],
          city: [''],
          postalCode: [''],  // , [Validators.pattern(postalRegex)]
          province: [{ value: 'British Columbia', disabled: false }],
          country: [{ value: 'Canada', disabled: false }],
        }),
        legalGuardianFiles: this.fb.array([]),  // This will be a collection of uploaded files
      }),

      declarationInformation: this.fb.group({
        declaredAndSigned: ['', Validators.requiredTrue],
        signature: ['', Validators.required],
      }),

      authorizationInformation: this.fb.group({
        approvedAuthorityNotification: ['', Validators.requiredTrue],
        readAndUnderstoodTermsAndConditions: ['', Validators.requiredTrue],
        signature: ['', Validators.required],

        allowCvapStaffSharing: [''],
        authorizedPersonFullName: [''],
        authorizedPersonPhoneNumber: [''],
        authorizedPersonRelationship: [''],
        authorizedPersonAgencyName: [''],
        authorizedPersonAgencyAddress: this.fb.group({
          line1: [''],
          line2: [''],
          city: [''],
          postalCode: [''],  // , [Validators.pattern(postalRegex)]
          province: [{ value: 'British Columbia', disabled: false }],
          country: [{ value: 'Canada', disabled: false }],
        }),
        authorizedPersonAuthorizesDiscussion: [''], //, Validators.required],
        authorizedPersonSignature: [''], //, Validators.required],
      }),
    });
  }

  onFileBundle(fileBundle: FileBundle) {
    try {
      // save the files submitted from the component for attachment into the submitted form.
      const patchObject = {};
      patchObject['crimeInformation.additionalInformationFiles'] = fileBundle;
      this.form.get('crimeInformation.additionalInformationFiles.filename').patchValue(fileBundle.fileName[0]);
      var splitValues = fileBundle.fileData[0].split(',');

      this.form.get('crimeInformation.additionalInformationFiles.body').patchValue(splitValues[1]);

      fileBundle = fileBundle;
    }
    catch (e) {
      console.log(e);
    }
  }
}
