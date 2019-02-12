import { Component, OnInit } from '@angular/core';
import { AppState } from '../app-state/models/app-state';
import { User } from '../models/user.model';
import { DynamicsContact } from '../models/dynamics-contact.model';
import * as CurrentUserActions from '../app-state/actions/current-user.action';
import { Store } from '@ngrx/store';
import { Subscription, Observable, Subject, forkJoin } from 'rxjs';
import { FormBuilder, FormGroup, Validators, FormArray, ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { defaultFormat as _rollupMoment } from 'moment';

import { UserDataService } from '../services/user-data.service';
import { AccountDataService } from '../services/account-data.service';
import { DynamicsAccount } from '../models/dynamics-account.model';
import { DynamicsApplicationModel } from '../models/dynamics-application.model';
import { FormBase } from '../shared/form-base';

import { COUNTRIES } from './country-list';

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

  otherTreatmentItems: FormArray;

  countryList = COUNTRIES;

  public currentFormStep: number;
  public summaryOfBenefitsUrl: string;

  // Should probably refactor these into a 'CountrySelection' class.
  primaryProvinceList: string[];
  primaryProvinceType: string;
  primaryPostalCodeType: string;
  primaryPostalCodeSample: string;

  alternateProvinceList: string[];
  alternateProvinceType: string;
  alternatePostalCodeType: string;
  alternatePostalCodeSample: string;

  representativeProvinceList: string[];
  representativeProvinceType: string;
  representativePostalCodeType: string;
  representativePostalCodeSample: string;

  saveFormData: any;

  public get otherTreatments(): FormArray {
    return this.form.get('medicalInformation.otherTreatments') as FormArray;
  }

  constructor(private userDataService: UserDataService,
    private store: Store<AppState>,
    private accountDataService: AccountDataService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,

  ) {
    super();

    this.currentFormStep = 0;
    var canada = COUNTRIES.filter(c => c.name.toLowerCase() == 'canada')[0];
    this.primaryProvinceList = canada.areas;
    this.alternateProvinceList = canada.areas;

    this.primaryProvinceType = canada.areaType;
    this.primaryPostalCodeType = canada.postalCodeName;
    this.primaryPostalCodeSample = canada.postalCodeSample;

    this.alternateProvinceType = canada.areaType;
    this.alternatePostalCodeType = canada.postalCodeName;
    this.alternatePostalCodeSample = canada.postalCodeSample;
  }

  updatePrimaryLocation(event) {
    var selection = event.target.value.toLowerCase();
    var selectedCountry = COUNTRIES.filter(c => c.name.toLowerCase() == selection)[0];
    this.primaryProvinceList = selectedCountry.areas;
    this.primaryProvinceType = selectedCountry.areaType;
    this.primaryPostalCodeType = selectedCountry.postalCodeName;
    this.primaryPostalCodeSample = selectedCountry.postalCodeSample;
  }

  updateAlternateLocation(event) {
    var selection = event.target.value.toLowerCase();
    var selectedCountry = COUNTRIES.filter(c => c.name.toLowerCase() == selection)[0];
    this.alternateProvinceList = selectedCountry.areas;
    this.alternateProvinceType = selectedCountry.areaType;
    this.alternatePostalCodeType = selectedCountry.postalCodeName;
    this.alternatePostalCodeSample = selectedCountry.postalCodeSample;
  }

  updateRepresentativeLocation(event) {
    var selection = event.target.value.toLowerCase();
    var selectedCountry = COUNTRIES.filter(c => c.name.toLowerCase() == selection)[0];
    this.representativeProvinceList = selectedCountry.areas;
    this.representativeProvinceType = selectedCountry.areaType;
    this.representativePostalCodeType = selectedCountry.postalCodeName;
    this.representativePostalCodeSample = selectedCountry.postalCodeSample;
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

// IF not populated correctly - you could get aggregated FormGroup errors object
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

  isFieldValid(field: string) {
    let formField = this.form.get(field);
    if (formField == null)
      return true;

    return this.form.get(field).valid || !this.form.get(field).touched;
  }

  valueOrEmpty(controlName: string): string {
    var control = this.form.get(controlName);

    if (control == null || control === undefined)
      return "--";

    if (control.value == null)
      return "--";

    if (control.value.length == 0)
      return "--";

    return control.value;
  }

  gotoPage(selectPage: any): void {
    window.scroll(0, 0);
    this.currentFormStep = selectPage.selectedIndex;
  }

  getFormGroupName(groupIndex: any) {
    let elements: Array<string> = ['introduction', 'personalInformation', 'crimeInformation', 'medicalInformation', 'expenseInformation', 'employmentIncomeInformation', 'representativeInformation', 'declarationInformation', 'authorizationInformation'];
    return elements[groupIndex];
  }

  gotoNextStep(stepper: MatStepper): void {
    if (stepper != null) {
      console.log(stepper.selectedIndex);
      var desiredFormIndex = stepper.selectedIndex;
      var formGroupName = this.getFormGroupName(desiredFormIndex);

      if (desiredFormIndex >= 0 && desiredFormIndex < 9) {
        var formParts = this.form.get(formGroupName);
        var formValid = true;

        if (formParts != null) {
          formValid = formParts.valid;
        }
        console.log("Page " + desiredFormIndex + " valid: " + formValid);

        if (formValid) {
          window.scroll(0, 0);
          stepper.next();
        } else {
          this.validateAllFormFields(formParts);
          console.log(this.getErrors(formParts));
        }

      }

      //if (stepper.selectedIndex == 2) {
      //  var form1Valid = this.form.get('crimeInformation').valid;
      //  console.log("Page 2 valid: " + form1Valid);
      //  if (form1Valid) {
      //    window.scroll(0, 0);
      //    stepper.next();
      //  } else {
      //    this.validateAllFormFields(this.form.get('crimeInformation'));
      //    console.log(this.getErrors(this.form.get('crimeInformation'));
      //  }
      //}
    }

    //stepper.next();
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

  ngOnInit() {
    this.summaryOfBenefitsUrl = 'http://gov.bc.ca';
    this.form = this.fb.group({
      introduction: this.fb.group({
        understoodInformation: ['', Validators.requiredTrue],
      }),
      personalInformation: this.fb.group({
        firstName: ['', Validators.required],
        middleName: [''],
        lastName: ['', Validators.required],

        iHaveOtherNames: [''],
        otherFirstName: [''],
        otherLastName: [''],
        dateOfNameChange: [''],

        phoneNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
        email: ['', [Validators.required, Validators.email]],
        birthDate: ['', Validators.required],

        sinPart1: [''],
        sinPart2: [''],
        sinPart3: [''],
        //sinPart1: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
        //sinPart2: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
        //sinPart3: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
        // Add dashes into SIN glue

        gender: [''],
        maritalStatus: [''],
        occupation: [''],

        primaryAddressLine1: [''],
        primaryAddressCity: [''],
        primaryAddressPostalCode: ['', [Validators.pattern(postalRegex)]],
        primaryAddressProvince: [{ value: 'British Columbia', disabled: false }],
        primaryAddressCountry: [{ value: 'Canada', disabled: false }],

        alternateAddressLine1: [''],
        alternateAddressCity: [''],
        alternateAddressPostalCode: ['', [Validators.pattern(postalRegex)]],
        alternateAddressProvince: [{ value: 'British Columbia', disabled: false }],
        alternateAddressCountry: [{ value: 'Canada', disabled: false }],
      }),
      crimeInformation: this.fb.group({
        typeOfCrime: ['', Validators.required],

        whenDidCrimeOccur: [''],
        crimePeriodStart: ['', Validators.required],
        crimePeriodEnd: [''],
        applicationFiledWithinOneYearFromCrime: [''],
        whyDidYouNotApplySooner: [''],

        crimeLocations: [''],
        crimeDetails: [''],
        crimeInjuries: [''],
        additionalInformation: this.fb.array([]),  // This will be a collection of uploaded files

        wasReportMadeToPolice: [''],

        policeReportedWhichPoliceForce: [''],
        policeReportedDate: [''],
        policeReportedPoliceFileNumber: [''],
        policeReportedInvestigatingOfficer: [''],

        noPoliceReportIndentification: [''],

        offenderFirstName: [''],
        offenderMiddleName: [''],
        offenderLastName: [''],
        offenderRelationship: [''],
        offenderBeenCharged: [''],  // 1 = Yes, 2 = No, 3 = Unknown   | Having binding issues

        courtFiles: this.fb.array([]),

        courtFileNumber: [''],
        courtLocation: [''],

        haveYouSuedOffender: [''],
        suedCourtLocation: [''],
        suedCourtFileNumber: [''],
        intendToSueOffender: [''],   // 1 = Yes, 2 = No, 3 = Undecided   | Having binding issues
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
        completingOnBehalfOf: ['1'],

        representativeFirstName: ['', Validators.required],
        representativeMiddleName: [''],
        representativeLastName: ['', Validators.required],

        representativeAddressLine1: [''],
        representativeAddressCity: [''],
        representativeAddressPostalCode: ['', [Validators.pattern(postalRegex)]],
        representativeAddressProvince: [{ value: 'British Columbia', disabled: false }],
        representativeAddressCountry: [{ value: 'Canada', disabled: false }],
        representativePhoneNumbr: ['', Validators.required],
        representativeEmail: ['', [Validators.required, Validators.email]],

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
        authorizedPersonAuthorizesDiscussion: [false, Validators.required],
        authorizedPersonSignature: ['', Validators.required],
        authorizedPersonSignDate: ['', Validators.required],
      }),
    });
  }

  submitApplication() {
    console.log("Form valid? " + this.form.valid);

    //if (this.form.valid) {
    this.save().subscribe(data => {
      console.log("submitting");
      this.router.navigate(['/application-success']);
    });
    //} else {
    //      console.log("form not validated");
    //      this.markAsTouched();
    //}
  }

  save(): Subject<boolean> {
    const subResult = new Subject<boolean>();
    const value = <DynamicsApplicationModel>{
      //this.form.get('businessProfile').value,
    };

    value.applicantsfirstname = this.form.get('personalInformation.firstName').value;
    value.applicantsmiddlename = this.form.get('personalInformation.middleName').value;
    value.applicantslastname = this.form.get('personalInformation.lastName').value;
    value.applicantsotherfirstname = this.form.get('personalInformation.otherFirstName').value;
    value.applicantsotherlastname = this.form.get('personalInformation.otherLastName').value;

    value.applicantsphoneNumber = this.form.get('personalInformation.phoneNumber').value;
    value.applicantsemail = this.form.get('personalInformation.email').value;
    value.applicantsbirthdate = this.form.get('personalInformation.birthDate').value;

    value.applicantsgender = this.form.get('personalInformation.gender').value;
    value.applicantsmaritalstatus = this.form.get('personalInformation.maritalStatus').value;

    value.typeofcrime = this.form.get('crimeInformation.typeOfCrime').value;

    this.busy = this.accountDataService.submitApplication(value)
        .toPromise()
        .then(res => {
          subResult.next(true);
        }, err => subResult.next(false));
    this.busy3 = Promise.resolve(this.busy);

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
}
