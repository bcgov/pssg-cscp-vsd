import { Component, OnInit } from '@angular/core';
import { AppState } from '../app-state/models/app-state';
import { User } from '../models/user.model';
import { Store } from '@ngrx/store';
import { Subscription, Observable, Subject, forkJoin } from 'rxjs';
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
import { JusticeApplicationDataService } from '../services/justice-application-data.service';
import { DynamicsApplicationModel } from '../models/dynamics-application.model';
import { PersonalInformationModel } from '../models/justice/personal-information.model';
import { CrimeInformationModel } from '../models/justice/crime-information.model';
import { FormBase } from '../shared/form-base';

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
  selector: 'app-victim-application',
  templateUrl: './victim-application.component.html',
  styleUrls: ['./victim-application.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})

export class VictimApplicationComponent extends FormBase implements OnInit {
  currentUser: User;
  dataLoaded = false;
  busy: Promise<any>;
  busy2: Promise<any>;
  busy3: Promise<any>;
  form: FormGroup;
  formFullyValidated: boolean;
  useApplicationType: string;

  otherTreatmentItems: FormArray;
  courtFileItems: FormArray;
  crimeLocationItems: FormArray;
  policeReportItems: FormArray;

  showAddCourtInfo: boolean = true;
  showRemoveCourtInfo: boolean = false;
  showAddCrimeLocation: boolean = true;
  showRemoveCrimeLocation: boolean = false;
  showAddPoliceReport: boolean = true;
  showRemovePoliceReport: boolean = false;

  public currentFormStep: number;
  public summaryOfBenefitsUrl: string;

  phoneIsRequired: boolean;
  emailIsRequired: boolean;
  addressIsRequired: boolean;

  saveFormData: any;
  personalModel: PersonalInformationModel;

  public get courtFiles(): FormArray {
    return this.form.get('crimeInformation.courtFiles') as FormArray;
  }

  public get otherTreatments(): FormArray {
    return this.form.get('medicalInformation.otherTreatments') as FormArray;
  }

  constructor(
    private justiceDataService: JusticeApplicationDataService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    super();

    this.phoneIsRequired = false;
    this.emailIsRequired = false;
    this.addressIsRequired = false;

    this.formFullyValidated = false;
    this.currentFormStep = 0;
  }

  ngOnInit() {
    let completeOnBehalfOf = this.route.snapshot.queryParamMap.get('ob');
    this.summaryOfBenefitsUrl = 'http://gov.bc.ca';

    this.form = this.buildApplicationForm();

    this.form.get('representativeInformation').patchValue({
      completingOnBehalfOf: parseInt(completeOnBehalfOf)
    });

    /* Need to rework this with the new app-address control */
    this.form.get('personalInformation.preferredMethodOfContact')
      .valueChanges
      .subscribe(value => {
        let phoneControl = this.form.get('personalInformation.phoneNumber');
        let emailControl = this.form.get('personalInformation.email');
        let addressControl = this.form.get('personalInformation').get('primaryAddress.line1');

        phoneControl.clearValidators();
        emailControl.clearValidators();
        addressControl.clearValidators();

        phoneControl.setErrors(null);
        emailControl.setErrors(null);
        addressControl.setErrors(null);

        let contactMethod = parseInt(value);
        if (contactMethod === 100000000) {
          phoneControl.setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(10)]);
          this.phoneIsRequired = true;
          this.emailIsRequired = false;
          this.addressIsRequired = false;
        } else if (contactMethod === 100000001) {
          emailControl.setValidators([Validators.required, Validators.email]);
          this.phoneIsRequired = false;
          this.emailIsRequired = true;
          this.addressIsRequired = false;
        } else if (contactMethod === 100000002) {
          addressControl.setValidators([Validators.required]);
          this.phoneIsRequired = false;
          this.emailIsRequired = false;
          this.addressIsRequired = true;
        }

        phoneControl.markAsTouched();
        emailControl.markAsTouched();
        addressControl.markAsTouched();

        addressControl.updateValueAndValidity();
        emailControl.updateValueAndValidity();
        phoneControl.updateValueAndValidity();
      });
  }

  showSignPad(group, control): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(SignPadDialog, dialogConfig);
    dialogRef.afterClosed().subscribe(
      data => {
        //console.log("Dialog output:", data)
        this.form.get(group).patchValue(
          { signature: data }
        );
      }
    ); 
  }

  validateAllFormFields(formGroup: any) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);

      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  getErrors(formGroup: any, errors: any = {}) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        errors[field] = control.errors;
      } else if (control instanceof FormGroup) {
        errors[field] = this.getErrors(control);
      }
    });
    return errors;
  }

  orEmpty(amI: FormControl): string {
    if (amI == null || amI === undefined)
      return "--";

    if (amI.value.length == 0)
      return "--";

    return amI.value;
  }

  isChildFieldValid(parent: string, field: string) {
    let formField = this.form.get(parent);
    if (formField == null)
      return true;

    return formField.get(field).valid || !formField.get(field).touched;
  }

  valueOrEmpty(controlName: string): string {
    var control = this.form.get(controlName);

    if (control == null || control === undefined)
      return "--";

    if (control.value == null || control.value === undefined)
      return "--";

    if (control.value.length == 0 || control.value.length === undefined)
      return "--";

    return control.value;
  }

  hasSignature(controlName: string): boolean {
    var control = this.form.get(controlName);

    if (control == null || control === undefined)
      return false;

    if (control.value == null || control.value === undefined)
      return false;

    if (control.value.length == 0 || control.value.length === undefined)
      return false;

    return control.value.length > 0;
  }

  getFormGroupName(groupIndex: any) {
    let elements: Array<string> = ['introduction', 'personalInformation', 'crimeInformation', 'medicalInformation', 'expenseInformation', 'employmentIncomeInformation', 'representativeInformation', 'declarationInformation', 'authorizationInformation'];
    return elements[groupIndex];
  }

  gotoPageIndex(stepper: MatStepper, selectPage: number): void {
    window.scroll(0, 0);
    stepper.selectedIndex = selectPage;
    this.currentFormStep = selectPage;
  }

  gotoPage(selectPage: MatStepper): void {
    window.scroll(0, 0);
    this.currentFormStep = selectPage.selectedIndex;
  }

  gotoNextStep(stepper: MatStepper): void {
    console.log(this.currentFormStep);
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

//        let errors = this.getErrors(this.form.get('crimeInformation'));
//        console.log('Form Valid: ' + formValid);
//        console.log(errors);
        if (formValid) {
          window.scroll(0, 0);
          stepper.next();
        } else {
          this.validateAllFormFields(formParts);
        }
      }
    }
  }

  addProvider(): void {
    this.otherTreatmentItems = this.form.get('medicalInformation.otherTreatments') as FormArray;
    this.otherTreatmentItems.push(this.createTreatmentItem());
  }

  removeProvider(index: number): void {
    this.otherTreatmentItems = this.form.get('medicalInformation.otherTreatments') as FormArray;
    this.otherTreatmentItems.removeAt(index);
  }

  createTreatmentItem(): FormGroup {
    return this.fb.group({
      providerType: '',   // 1 = Specialist, 2 = Counsellor/Psychologist, 3 = Dentist, 4 = Other ---- Figure out how to map these better
      providerName: '',
      providerPhoneNumber: '',
      providerAddress: '',
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
      location: ''
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
    if (this.form.valid) {
      this.formFullyValidated = true;
      this.save().subscribe(
      data => {
        console.log("submitting");
        this.router.navigate(['/application-success']);
      },
      err => {
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

  testSnaks(): void {
    let content = this.form.get('personalInformation').value;
    this.personalModel = content;

    let formData = <DynamicsApplicationModel> {
      Introduction: this.form.get('introduction').value,
      PersonalInformation: this.form.get('personalInformation').value,
      CrimeInformation: this.form.get('crimeInformation').value,
      MedicalInformation: this.form.get('medicalInformation').value,
      RepresentativeInformation: this.form.get('representativeInformation').value,
    };

    //formData.PersonalInformation = this.form.get('personalInformation').value;
//    formData.CrimeInformation = this.form.get('crimeInformation').value;

    console.log(formData);
  }

  save(): Subject<boolean> {
    const subResult = new Subject<boolean>();
    const formData = <DynamicsApplicationModel>{
      Introduction: this.form.get('introduction').value,
      PersonalInformation: this.form.get('personalInformation').value,
      CrimeInformation: this.form.get('crimeInformation').value,
      MedicalInformation: this.form.get('medicalInformation').value,
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

    //const businessProfileControls = (<FormGroup>(this.form.get('businessProfile'))).controls;
    //for (const c in businessProfileControls) {
    //  if (typeof (businessProfileControls[c].markAsTouched) === 'function') {
    //    businessProfileControls[c].markAsTouched();
    //  }
    //}

    //const additionalContactControls = (<FormGroup>(this.form.get('additionalContact'))).controls;
    //for (const c in additionalContactControls) {
    //  if (typeof (additionalContactControls[c].markAsTouched) === 'function') {
    //    additionalContactControls[c].markAsTouched();
    //  }
    //}

    //const primaryContactControls = (<FormGroup>(this.form.get('primaryContact'))).controls;
    //for (const c in primaryContactControls) {
    //  if (typeof (primaryContactControls[c].markAsTouched) === 'function') {
    //    primaryContactControls[c].markAsTouched();
    //  }
    //}
  }

  private buildApplicationForm() : FormGroup {
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

        gender: [0, Validators.required],
        maritalStatus: [0, Validators.required],
        sinPart1: [''],
        sinPart2: [''],
        sinPart3: [''],
        //sinPart1: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
        //sinPart2: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
        //sinPart3: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
        occupation: [''],

        preferredMethodOfContact: [0, [Validators.required, Validators.min(100000000)]],

        phoneNumber: [''],
        alternatePhoneNumber: [''],
        email: [''],
        birthDate: [''],

        primaryAddress: this.fb.group({
          line1: ['', Validators.required],
          line2: [''],
          line3: [''],
          city: ['', Validators.required],
          postalCode: ['', [Validators.pattern(postalRegex), Validators.required]],
          province: [{ value: 'British Columbia', disabled: false }],
          country: [{ value: 'Canada', disabled: false }],
        }),
        alternateAddress: this.fb.group({
          line1: [''],
          line2: [''],
          line3: [''],
          city: [''],
          postalCode: [''],
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

        crimeLocation: ['', Validators.required],
        crimeLocations: this.fb.array([this.createCrimeLocationItem()]),
        crimeDetails: ['', Validators.required],
        crimeInjuries: ['', Validators.required],
        additionalInformation: this.fb.array([]),  // This will be a collection of uploaded files

        wasReportMadeToPolice: [''], // No: 100000000 Yes: 100000001

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
        offenderBeenCharged: ['', [Validators.required, Validators.min(100000000)]],  // Yes: 100000000 No: 100000001 Undecided: 100000002

        courtFiles: this.fb.array([this.createCourtInfoItem()]),

        haveYouSuedOffender: [''], // No: 100000000   Yes: 100000001
        suedCourtLocation: [''],
        suedCourtFileNumber: [''],
        intendToSueOffender: [''], // Yes: 100000000 No: 100000001 Undecided: 100000002

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
            line3: [''],
            city: [''],
            postalCode: [''],  // , [Validators.pattern(postalRegex)]
            province: [{ value: 'British Columbia', disabled: false }],
            country: [{ value: 'Canada', disabled: false }],
          }),
          signName: [''],
          signDate: [''],
          signature: [''],
        }),
      }),
      medicalInformation: this.fb.group({
        doYouHaveMedicalServicesCoverage: [''],
        personalHealthNumber: [''],

        doYouHaveOtherHealthCoverage: [''],
        otherHealthCoverageProviderName: [''],
        otherHealthCoverageExtendedPlanNumber: [''],

        weYouTreatedAtHospital: [''],
        treatedAtHospitalName: [''],
        treatedAtHospitalDate: [''],

        beingTreatedByFamilyDoctor: [''],
        familyDoctorName: [''],
        familyDoctorPhoneNumber: [''],
        familyDoctorAddress: [''],

        otherTreatments: this.fb.array([]),  // Not sure how this will post yet   [ This is filled by the method 'createItem' ]
      }),
      expenseInformation: this.fb.group({
        haveMedicalExpenses: [false],
        haveDentalExpenses: [false],
        havePrescriptionDrugExpenses: [false],
        haveCounsellingExpenses: [false],
        haveLostEmploymentIncomeExpenses: [false],
        havePersonalPropertyLostExpenses: [false],
        haveProtectiveMeasureExpenses: [false],
        haveDisabilityExpenses: [false],
        haveCrimeSceneCleaningExpenses: [false],
        haveOtherExpenses: [false],
        otherSpecificExpenses: [''],

        haveDisabilityPlanBenefits: [''],
        haveEmploymentInsuranceBenefits: [''],
        haveIncomeAssistanceBenefits: [''],
        haveCanadaPensionPlanBenefits: [''],
        haveAboriginalAffairsAndNorthernDevelopmentCanadaBenefits: [''],
        haveCivilActionBenefits: [''],
        haveOtherBenefits: [''],
        otherSpecificBenefits: [''],
      }),
      employmentIncomeInformation: this.fb.group({
        wereYouEmployedAtTimeOfCrime: [''],  // 1 = Yes, 2 = No, 3 = Self-Employed
        wereYouAtWorkAtTimeOfIncident: [''],
        haveYouAppliedForWorkersCompensation: [''],
        workersCompensationClaimNumber: [''],
        didYouMissWorkDueToCrime: [''],
        daysWorkMissedStart: [''],
        daysWorkMissedEnd: [''],
        didYouLoseWages: [''],

        employerName: [''],
        employerPhoneNumber: [''],
        employerAddress: [''],
        mayContactEmployer: [''],
      }),

      representativeInformation: this.fb.group({
        completingOnBehalfOf: [100000000, [Validators.required, Validators.min(100000000), Validators.max(100000003)]], // Self: 100000000  Victim Service Worker: 100000001  Parent/Guardian: 100000002,
        representativeFirstName: [''], //, Validators.required],
        representativeMiddleName: [''],
        representativeLastName: [''], //, Validators.required],

        representativeAddress: this.fb.group({
          line1: [''],
          line2: [''],
          line3: [''],
          city: [''],
          postalCode: [''],  // , [Validators.pattern(postalRegex)]
          province: [{ value: 'British Columbia', disabled: false }],
          country: [{ value: 'Canada', disabled: false }],
        }),

        representativePhoneNumber: [''], //, Validators.required],
        representativeEmail: [''], //, [Validators.required, Validators.email]],

        relationshipImmediateFamilyMember: [''],
        relationshipToVictim: [''],

        relationshipLegalRepresentative: [''],
        relationshipLegalAuthority: [''],
        // Legal Guardian forms would go here
      }),

      declarationInformation: this.fb.group({
        declaredAndSigned: ['', Validators.required],
        signature: ['', Validators.required],
        signDate: ['', Validators.required],
      }),

      authorizationInformation: this.fb.group({
        approvedAuthorityNotification: [false, Validators.required],
        readAndUnderstoodTermsAndConditions: [false, Validators.required],
        signature: ['', Validators.required],
        signDate: ['', Validators.required],

        allowCvapStaffSharing: [''],
        authorizedPersonFullName: [''],
        authorizedPersonPhoneNumber: [''],
        authorizedPersonRelationship: [''],
        authorizedPersonAgencyName: [''],
        authorizedPersonAgencyAddress: [''],
        authorizedPersonAuthorizesDiscussion: [false], //, Validators.required],
        authorizedPersonSignature: [''], //, Validators.required],
        authorizedPersonSignDate: [''], //, Validators.required],
      }),
    });
  }
}
