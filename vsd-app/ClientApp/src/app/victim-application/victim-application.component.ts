import { Component, OnInit } from '@angular/core';
import { User } from '../models/user.model';
import { FormBuilder, FormGroup, Validators, FormArray, ValidatorFn, FormControl } from '@angular/forms';
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
import { FormBase } from '../shared/form-base';
import { HOSPITALS } from '../shared/hospital-list';
import { EnumHelper } from '../shared/enums-list';
import { MY_FORMATS } from '../shared/enums-list';
import { Application, Introduction, PersonalInformation, CrimeInformation, MedicalInformation, ExpenseInformation, EmploymentIncomeInformation, RepresentativeInformation, DeclarationInformation, AuthorizationInformation } from '../interfaces/application.interface';
import { EiInfoForm } from '../employment-income/employment-income.component';

const moment = _rollupMoment || _moment;

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

export class VictimApplicationComponent extends FormBase implements OnInit, CanDeactivateGuard {
  currentUser: User;
  busy: Promise<any>;
  busy2: Promise<any>;
  busy3: Promise<any>;
  // form: FormGroup; // form is defined as a FormGroup in the FormBase
  showValidationMessage: boolean;
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
  showAddEmployer: boolean = true;
  showRemoveEmployer: boolean = false;
  showAddProvider: boolean = true;
  showRemoveProvider: boolean = false;

  public currentFormStep: number = 0; // form flow. Which step are we on?

  phoneIsRequired: boolean = false;
  emailIsRequired: boolean = false;
  addressIsRequired: boolean = true; // Always required

  representativePhoneIsRequired: boolean = false;
  representativeEmailIsRequired: boolean = false;
  representativeAddressIsRequired: boolean = false;

  expenseMinimumMet: boolean = null;
  saveFormData: any;

  matchingEmail: string; // this is the value of the email that both email fields should match.

  // a field that represents the current employment income information state
  employmentIncomeInformation: EmploymentIncomeInformation;


  constructor(
    private justiceDataService: JusticeApplicationDataService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public snackBar: MatSnackBar,
    private matDialog: MatDialog, // popup to show static content
  ) {
    super();
  }

  canDeactivate() {
    // TODO: IDK. It seems like this is part of a system to detect if a user backs away from a page.
    let formDirty = false;

    formDirty = this.form.dirty && this.form.touched;
    console.log('Form Dirty: ' + formDirty);

    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.matDialog.open(DeactivateGuardDialog, dialogConfig);
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

    // initialize the form
    this.buildApplicationForm();

    // check the route for info about a person filling it in on their behalf
    // TODO: if the user changes this can they spoof an agent?
    let completeOnBehalfOf = this.route.snapshot.queryParamMap.get('ob');
    this.form.get('representativeInformation').patchValue({
      completingOnBehalfOf: parseInt(completeOnBehalfOf)
    });

    // subscribe to form changes to set the form in various ways
    this.form.get('personalInformation.preferredMethodOfContact').valueChanges.subscribe(() => this.setRequiredFields());
    this.form.get('medicalInformation.wereYouTreatedAtHospital').valueChanges.subscribe(() => this.setRequiredFields());
    this.form.get('expenseInformation.haveLostEmploymentIncomeExpenses').valueChanges.subscribe(() => this.setRequiredFields());
    this.form.get('representativeInformation.completingOnBehalfOf').valueChanges.subscribe(() => this.setRequiredFields());
    this.form.get('representativeInformation.representativePreferredMethodOfContact').valueChanges.subscribe(() => this.setRequiredFields());
    this.form.get('authorizationInformation.allowCvapStaffSharing').valueChanges.subscribe(() => this.setRequiredFields());
  }

  buildApplicationForm(): void {
    this.form = this.fb.group({
      introduction: this.fb.group({
        understoodInformation: [null, Validators.requiredTrue]
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
        birthDate: ['', [Validators.required]],
        maritalStatus: [0, [Validators.required, Validators.min(100000000), Validators.max(100000005)]],
        sin: ['', [Validators.minLength(9), Validators.maxLength(9)]], // needs refinement
        occupation: [''],

        preferredMethodOfContact: [0, [Validators.required, Validators.min(1), Validators.max(4)]], // Phone = 2, Email = 1, Mail = 4

        permissionToContactViaMethod: [false],
        agreeToCvapCommunicationExchange: [''],

        phoneNumber: [''],
        alternatePhoneNumber: [''],
        email: ['', [Validators.required]],
        confirmEmail: ['', [Validators.required]],

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
      crimeInformation: this.fb.group({
        typeOfCrime: ['', Validators.required],

        unsureOfCrimeDates: [''],
        whenDidCrimeOccur: [''], // True = Period of Time, False = Start date only
        crimePeriodStart: ['', Validators.required],
        crimePeriodEnd: [''],
        applicationFiledWithinOneYearFromCrime: [''],
        whyDidYouNotApplySooner: [''],

        crimeLocation: [''], // REMOVE AFTER DEMO
        crimeLocations: this.fb.array([this.createCrimeLocationItem()]),
        crimeDetails: ['', Validators.required],
        crimeInjuries: ['', Validators.required],
        additionalInformationFiles: this.fb.array([]), // This will be a collection of uploaded files

        wasReportMadeToPolice:
          [
            0, [Validators.required, Validators.min(100000000), Validators.max(100000001)]
          ], // No: 100000000 Yes: 100000001

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
        offenderBeenCharged:
          [
            0, [Validators.required, Validators.min(100000000), Validators.max(100000002)]
          ], // Yes: 100000000 No: 100000001 Undecided: 100000002

        courtFiles: this.fb.array([this.createCourtInfoItem()]),

        haveYouSuedOffender:
          [
            0, [Validators.required, Validators.min(100000000), Validators.max(100000001)]
          ], // No: 100000000   Yes: 100000001
        intendToSueOffender: [0], // Yes: 100000000 No: 100000001 Undecided: 100000002

        racafInformation: this.fb.group({
          applyToCourtForMoneyFromOffender: [null, [Validators.min(100000000), Validators.max(100000002)]],
          expensesRequested: [''],
          expensesAwarded: [null],
          expensesReceived: [null],
          willBeTakingLegalAction: [null, [Validators.min(100000000), Validators.max(100000002)]],
          lawyerOrFirmName: [''],
          lawyerAddress: this.fb.group({
            line1: [''],
            line2: [''],
            city: [''],
            postalCode: [''], // , [Validators.pattern(postalRegex)]
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
        minimumExpensesSelected: ['', Validators.required],

        haveDisabilityPlanBenefits: [false],
        haveEmploymentInsuranceBenefits: [false],
        haveIncomeAssistanceBenefits: [false],
        haveCanadaPensionPlanBenefits: [false],
        haveAboriginalAffairsAndNorthernDevelopmentCanadaBenefits: [false],
        haveCivilActionBenefits: [false],
        haveOtherBenefits: [false],
        otherSpecificBenefits: [''],
        noneOfTheAboveBenefits: [false],
      }, { validator: this.requireCheckboxesToBeCheckedValidator }),
      employmentIncomeInformation: [null, Validators.required],

      representativeInformation: this.fb.group({
        completingOnBehalfOf: [null, [Validators.min(100000000), Validators.max(100000003)]], // Self: 100000000  Victim Service Worker: 100000001  Parent/Guardian: 100000002,
        representativeFirstName: [''], //, Validators.required],
        representativeMiddleName: [''],
        representativeLastName: [''], //, Validators.required],
        representativePreferredMethodOfContact: [null, [Validators.min(100000000), Validators.max(100000002)]], // Phone = 100000000, Email = 100000001, Mail = 100000002
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

        allowCvapStaffSharing: ['', Validators.required],
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
    // set default contact method
    this.setPreferredContactMethod();
  }

  showSummaryOfBenefits(): void {
    const summaryDialogRef = this.matDialog.open(SummaryOfBenefitsDialog, { maxWidth: '800px !important', data: 'victim' });
  }
  showSignPad(group, control): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.matDialog.open(SignPadDialog, dialogConfig);
    dialogRef.afterClosed().subscribe(
      data => {
        // TODO: This timeout is required so the page structure doesn't explode after the signature is filled.
        // why is this is like this. Leaving the patch in there.
        // I suspect that maybe converting the signature to png needs to finish before proceeding
        // Maybe this will fix itself as the form is cleaned up.
        // This actually breaks the whole page layout on closing the signature box if removed. WHAAAA
        setTimeout(() => {
          var patchObject = {};
          patchObject[control] = data;
          this.form.get(group).patchValue(
            patchObject
          );
        }, 1)
      },
      err => console.log(err)
    );
  }
  verifyCancellation(): void {
    const verifyDialogConfig = new MatDialogConfig();
    verifyDialogConfig.disableClose = true;
    verifyDialogConfig.autoFocus = true;
    verifyDialogConfig.data = 'witness';

    const verifyDialogRef = this.matDialog.open(CancelApplicationDialog, verifyDialogConfig);
    verifyDialogRef.afterClosed().subscribe(
      data => {
        if (data === true) {
          this.router.navigate(['/application-cancelled']);
          return;
        }
      },
      err => { console.log(err) }
    );
  }

  changeGroupValidity(values: any): void {
    // whenever an expenseInformation checkbox is changed we
    // set whether the minimum expenses value is met into part of the form that isn't user editable.
    let expenseMinimumMet = '';
    const x = [
      this.form.get('expenseInformation.haveMedicalExpenses'),
      this.form.get('expenseInformation.haveDentalExpenses'),
      this.form.get('expenseInformation.benefitsPrescription'),
      this.form.get('expenseInformation.havePrescriptionDrugExpenses'),
      this.form.get('expenseInformation.haveCounsellingExpenses'),
      this.form.get('expenseInformation.haveLostEmploymentIncomeExpenses'),
      this.form.get('expenseInformation.havePersonalPropertyLostExpenses'),
      this.form.get('expenseInformation.haveProtectiveMeasureExpenses'),
      this.form.get('expenseInformation.haveDisabilityExpenses'),
      this.form.get('expenseInformation.haveCrimeSceneCleaningExpenses'),
      this.form.get('expenseInformation.haveOtherExpenses'),
    ];
    //determine if one of the checkboxes is true
    let oneChecked = false;
    x.forEach(c => {
      // TODO: This should always return if not null because truthy. Second if should never trigger?
      if (oneChecked)
        return;
      if (c instanceof FormControl) {
        if (c.value === true)
          oneChecked = true;
      }
    });
    // fake a 'true' as a string
    expenseMinimumMet = oneChecked ? 'yes' : '';
    this.form.get('expenseInformation').patchValue({
      minimumExpensesSelected: expenseMinimumMet
    });
  }

  gotoPageIndex(stepper: MatStepper, selectPage: number): void {
    // TODO: Cannot find where this method is called.
    window.scroll(0, 0);
    stepper.selectedIndex = selectPage;
    this.currentFormStep = selectPage;
  }
  gotoPage(selectPage: MatStepper): void {
    // When a user clicks on the stepper this is triggered
    window.scroll(0, 0);
    this.showValidationMessage = false;
    this.currentFormStep = selectPage.selectedIndex;
  }

  gotoNextStep(stepper: MatStepper): void {
    // when a user clicks the continue button we move them to the next part of the form
    let elements: Array<string> = ['introduction', 'personalInformation', 'crimeInformation', 'medicalInformation', 'expenseInformation', 'employmentIncomeInformation', 'representativeInformation', 'declarationInformation', 'authorizationInformation'];

    if (stepper != null) {
      // the stepper indexes match our form indexes
      const desiredFormIndex: number = stepper.selectedIndex;
      // get the text value of the form index
      const formGroupName = elements[desiredFormIndex];
      console.log(`Form for validation is ${formGroupName}.`);
      // be sure that the stepper is in range
      if (desiredFormIndex >= 0 && desiredFormIndex < elements.length) {
        // collect the matching form group from the form
        const formParts = this.form.get(formGroupName);
        // TODO: how do we know this is true?
        let formValid = true;

        // if there is a form returned with the name
        if (formParts != null) {
          // collect the validity of it
          formValid = formParts.valid;
          console.log(formParts);
        } else {
          alert('That was a null form. Nothing to validate')
        }

        if (formValid) {
          console.log('Form is valid so proceeding to next step.')
          this.showValidationMessage = false;
          window.scroll(0, 0);
          stepper.next();
        } else {
          console.log('Form is not valid rerun the validation and show the validation message.')
          this.validateAllFormFields(formParts);
          this.showValidationMessage = true;
        }
      }
    }
  }

  addProvider(): void {
    // add a medical treatment provider to the list
    this.otherTreatmentItems = this.form.get('medicalInformation.otherTreatments') as FormArray;
    this.otherTreatmentItems.push(this.createTreatmentItem());
    this.showAddProvider = this.otherTreatmentItems.length < 5;
    this.showRemoveProvider = this.otherTreatmentItems.length > 1;
  }

  removeProvider(index: number): void {
    // when the user clicks to remove the medical provider this removes the provider at the index clicked
    this.otherTreatmentItems = this.form.get('medicalInformation.otherTreatments') as FormArray;
    this.otherTreatmentItems.removeAt(index);
    this.showAddProvider = this.otherTreatmentItems.length < 5;
    this.showRemoveProvider = this.otherTreatmentItems.length > 1;
  }

  createTreatmentItem(): FormGroup {
    // make a form group for insertion into the form
    return this.fb.group({
      providerType: [0],   // 100000001 = Specialist, 100000002 = Counsellor/Psychologist, 100000003 = Dentist, 100000004 = Other
      providerName: [''],
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

  addEmployer(): void {
    // add an employer to the list
    this.employerItems = this.form.get('employmentIncomeInformation.employers') as FormArray;
    this.employerItems.push(this.createEmployerItem());
    this.showAddEmployer = this.employerItems.length < 5;
    this.showRemoveEmployer = this.employerItems.length > 1;
  }

  removeEmployer(index: number): void {
    // remove the employer from the list of employers
    this.employerItems = this.form.get('employmentIncomeInformation.employers') as FormArray;
    this.employerItems.removeAt(index);
    this.showAddEmployer = this.employerItems.length < 5;
    this.showRemoveEmployer = this.employerItems.length > 1;
  }

  createEmployerItem(): FormGroup {
    // create an employer form group when the user clicks to add a new one.
    return this.fb.group({
      employerName: ['', Validators.required],
      employerPhoneNumber: ['', Validators.required],
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

  getEmployerItem(index: number): FormControl {
    // TODO: this appears to be unused.
    // collect item from the employer array.
    return (<FormArray>this.form.get('employmentIncomeInformation.employers')).controls[index] as FormControl;
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

  producePDF() {
    //let formData = {
    //  Introduction: this.form.get('introduction').value,
    //  PersonalInformation: this.form.get('personalInformation').value,
    //  CrimeInformation: this.form.get('crimeInformation').value,
    //  MedicalInformation: this.form.get('medicalInformation').value,
    //  ExpenseInformation: this.form.get('expenseInformation').value,
    //  EmploymentIncomeInformation: this.form.get('employmentIncomeInformation').value,
    //  RepresentativeInformation: this.form.get('representativeInformation').value,
    //  DeclarationInformation: this.form.get('declarationInformation').value,
    //  AuthorizationInformation: this.form.get('authorizationInformation').value,
    //};
    //var printString = JSON.stringify(formData);
    //var wnd = window.open("about:blank", "", "_blank");
    //wnd.document.write(printString);

    //window.print();

    var printContents = document.getElementById('pdfPrintGroup').innerHTML;
    var w = window.open();
    w.document.write(printContents);
    w.print();
    //w.close();
  }

  submitApplication() {
    //let formIsValid = true;showValidationMessage
    if (this.form.valid) {
      this.justiceDataService.submitApplication(this.harvestForm())
        .subscribe(
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
      this.markAsTouched();
    }
  }

  harvestForm(): Application {
    return {
      Introduction: this.form.get('introduction').value as Introduction,
      PersonalInformation: this.form.get('personalInformation').value as PersonalInformation,
      CrimeInformation: this.form.get('crimeInformation').value as CrimeInformation,
      MedicalInformation: this.form.get('medicalInformation').value as MedicalInformation,
      ExpenseInformation: this.form.get('expenseInformation').value as ExpenseInformation,
      EmploymentIncomeInformation: this.form.get('employmentIncomeInformation').value as EmploymentIncomeInformation,
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

  // marking the form as touched makes the validation messages show
  markAsTouched() {
    this.form.markAsTouched();
  }
  // -----------METHODS TO ADJUST FORM STATE ---------------------------------
  setPreferredContactMethod(): void {
    // responsible for setting preferred contact information for the person filling out the form

    let contactMethod = parseInt(this.form.get('personalInformation.preferredMethodOfContact').value);
    if (typeof contactMethod != 'number') console.log('Set preferred contact method should be a number but is not for some reason. ' + typeof contactMethod);
    // maybe the form initializes with null?
    if (!contactMethod) contactMethod = 0;
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
    addressControl.setValidators([Validators.required]);
    for (let control of addressControls) {
      control.setValidators([Validators.required]);
    }

    if (contactMethod === 2) {
      phoneControl.setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(10)]);
      this.phoneIsRequired = true;
      this.emailIsRequired = false;
      this.addressIsRequired = true; // Always true
    } else if (contactMethod === 1) {
      emailControl.setValidators([Validators.required]); // need to add validator to check these two are the same
      emailConfirmControl.setValidators([Validators.required]); // need to add validator to check these two are the same
      this.phoneIsRequired = false;
      this.emailIsRequired = true;
      this.addressIsRequired = true; // Always true
    } else if (contactMethod === 4) {
      this.phoneIsRequired = false;
      this.emailIsRequired = false;
      this.addressIsRequired = true; // Always true
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
  }
  setHospitalTreatment(): void {
    const yesNo: boolean = this.form.get('medicalInformation.wereYouTreatedAtHospital').value === 'true';
    if (typeof yesNo != 'boolean') console.log('Set hospital treatment should be a boolean but is not for some reason. ' + typeof yesNo);

    // Did you go to a hospital?
    let hospitalControl = this.form.get('medicalInformation.treatedAtHospitalName');
    // get rid of old validators
    hospitalControl.clearValidators();
    hospitalControl.setErrors(null);
    // if yes the hospital part is required
    if (yesNo) {
      hospitalControl.setValidators([Validators.required]);
    }
  }
  setLostEmploymentIncomeExpenses(): void {
    // if the employment income expenses are set to true
    // the employed when crime occured should become required
    // the as a result of any crime related injuries did you miss work should become required.
    const isChecked: boolean = this.form.get('expenseInformation.haveLostEmploymentIncomeExpenses').value === 'true';
    if (typeof isChecked != 'boolean') console.log('Set lost employment income expenses should be a boolean but is not for some reason. ' + typeof isChecked);

    let employmentIncomeInformation = this.form.get('employmentIncomeInformation');

    if (isChecked) {
      employmentIncomeInformation.clearValidators();
      employmentIncomeInformation.setErrors(null);
      employmentIncomeInformation.setValidators([Validators.required]);
    } else {
      employmentIncomeInformation.clearValidators();
      employmentIncomeInformation.setErrors(null);
    }
  }
  setEmployedAtCrimeTime(): void {
    const responseCode: number = parseInt(this.form.get('employmentIncomeInformation.wereYouEmployedAtTimeOfCrime').value);
    if (typeof responseCode != 'number') console.log('Set representative preferred contact method should be a number but is not for some reason. ' + typeof responseCode);
    let wereYouAtWork = this.form.get('employmentIncomeInformation.wereYouAtWorkAtTimeOfIncident');
    wereYouAtWork.clearValidators();
    wereYouAtWork.setErrors(null);

    // if value matches encoded
    if (responseCode === 100000000) {
      wereYouAtWork.setValidators([Validators.required]);
    }
  }
  setIncidentAtWork(): void {
    const isChecked: boolean = this.form.get('employmentIncomeInformation.wereYouAtWorkAtTimeOfIncident').value === 'true';
    if (typeof isChecked != 'boolean') console.log('Set injured at work should be a boolean but is not for some reason. ' + typeof isChecked);

    let appliedForWorkersComp = this.form.get('employmentIncomeInformation.haveYouAppliedForWorkersCompensation');

    appliedForWorkersComp.clearValidators();
    appliedForWorkersComp.setErrors(null);

    let useValidation = isChecked === true;
    if (useValidation) {
      appliedForWorkersComp.setValidators([Validators.required]);
    }
  }
  setMissedWorkDueToCrime(): void {
    const isChecked: boolean = this.form.get('employmentIncomeInformation.didYouMissWorkDueToCrime').value === 'true';
    if (typeof isChecked != 'boolean') console.log('Set missed work due to crime should be a boolean but is not for some reason. ' + typeof isChecked);

    let missedWorkStartDate = this.form.get('employmentIncomeInformation.daysWorkMissedStart');
    let lostWages = this.form.get('employmentIncomeInformation.didYouLoseWages');
    let selfEmployed = this.form.get('employmentIncomeInformation.areYouSelfEmployed');
    let mayContactEmployer = this.form.get('employmentIncomeInformation.mayContactEmployer');
    let employerControls = this.form.get('employmentIncomeInformation.employers') as FormArray;

    missedWorkStartDate.clearValidators();
    missedWorkStartDate.setErrors(null);
    lostWages.clearValidators();
    lostWages.setErrors(null);
    selfEmployed.clearValidators();
    selfEmployed.setErrors(null);
    mayContactEmployer.clearValidators();
    mayContactEmployer.setErrors(null);
    for (let control of employerControls.controls) {
      let control1 = control.get('employerName');
      let control2 = control.get('employerPhoneNumber');
      control1.clearValidators();
      control1.setErrors(null);
      control2.clearValidators();
      control2.setErrors(null);
    }

    let useValidation = isChecked === true;
    if (useValidation) {
      missedWorkStartDate.setValidators([Validators.required]);
      lostWages.setValidators([Validators.required]);
      selfEmployed.setValidators([Validators.required]);
      mayContactEmployer.setValidators([Validators.required]);
      for (let control of employerControls.controls) {
        let control1 = control.get('employerName');
        let control2 = control.get('employerPhoneNumber');
        control1.setValidators([Validators.required]);
        control2.setValidators([Validators.required]);
      }
    }
  }
  setCompletingOnBehalfOf(): void {
    const responseCode: number = parseInt(this.form.get('representativeInformation.completingOnBehalfOf').value);
    if (typeof responseCode != 'number') console.log('Set representative preferred contact method should be a number but is not for some reason. ' + typeof responseCode);
    let representativeFirstName = this.form.get('representativeInformation.representativeFirstName');
    let representativeLastName = this.form.get('representativeInformation.representativeLastName');
    let representativePreferredMethodOfContact = this.form.get('representativeInformation.representativePreferredMethodOfContact');

    representativeFirstName.clearValidators();
    representativeFirstName.setErrors(null);
    representativeLastName.clearValidators();
    representativeLastName.setErrors(null);
    representativePreferredMethodOfContact.clearValidators();
    representativePreferredMethodOfContact.setErrors(null);

    let useValidation = responseCode === 100000001 || responseCode === 100000002 || responseCode === 100000003;
    this.setRepresentativePreferredMethodOfContact();  // Have to clear contact validators on contact method change
    if (useValidation) {
      representativeFirstName.setValidators([Validators.required]);
      representativeLastName.setValidators([Validators.required]);
      representativePreferredMethodOfContact.setValidators([Validators.required, Validators.min(100000000), Validators.max(100000002)]);
    }
  }
  setRepresentativePreferredMethodOfContact(): void {
    // TODO: this responseCode is a string for some reason in the form instead of a number. Why?
    const responseCode: number = parseInt(this.form.get('representativeInformation.representativePreferredMethodOfContact').value);
    if (typeof responseCode != 'number') console.log('Set representative preferred contact method should be a number but is not for some reason. ' + typeof responseCode);
    let phoneControl = this.form.get('representativeInformation.representativePhoneNumber');
    let emailControl = this.form.get('representativeInformation.representativeEmail');
    let addressControls = [
      this.form.get('representativeInformation').get('representativeAddress.country'),
      this.form.get('representativeInformation').get('representativeAddress.province'),
      this.form.get('representativeInformation').get('representativeAddress.city'),
      this.form.get('representativeInformation').get('representativeAddress.line1'),
      this.form.get('representativeInformation').get('representativeAddress.postalCode'),
    ];

    phoneControl.clearValidators();
    phoneControl.setErrors(null);
    emailControl.clearValidators();
    emailControl.setErrors(null);
    for (let control of addressControls) {
      control.clearValidators();
      control.setErrors(null);
    }

    if (responseCode === 100000000) {
      phoneControl.setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(10)]);
      this.representativePhoneIsRequired = true;
      this.representativeEmailIsRequired = false;
      this.representativeAddressIsRequired = false;
    } else if (responseCode === 100000001) {
      emailControl.setValidators([Validators.required, Validators.email]);
      this.representativePhoneIsRequired = false;
      this.representativeEmailIsRequired = true;
      this.representativeAddressIsRequired = false;
    } else if (responseCode === 100000002) {
      for (let control of addressControls) {
        control.setValidators([Validators.required]);
      }
      this.representativePhoneIsRequired = false;
      this.representativeEmailIsRequired = false;
      this.representativeAddressIsRequired = true;
    }

    phoneControl.markAsTouched();
    phoneControl.updateValueAndValidity();
    emailControl.markAsTouched();
    emailControl.updateValueAndValidity();
    for (let control of addressControls) {
      control.markAsTouched();
      control.updateValueAndValidity();
    }
  }
  setCvapStaffSharing() {
    const isChecked: boolean = this.form.get('authorizationInformation.allowCvapStaffSharing').value === 'true';
    if (typeof isChecked != 'boolean') console.log('Set CVAP Staff Sharing should be a boolean but is not for some reason. ' + typeof isChecked);

    let authorizedPersonAuthorizesDiscussion = this.form.get('authorizationInformation.authorizedPersonAuthorizesDiscussion');
    let authorizedPersonSignature = this.form.get('authorizationInformation.authorizedPersonSignature');

    authorizedPersonAuthorizesDiscussion.clearValidators();
    authorizedPersonAuthorizesDiscussion.setErrors(null);
    authorizedPersonSignature.clearValidators();
    authorizedPersonSignature.setErrors(null);

    let useValidation = isChecked === true;
    if (useValidation) {
      authorizedPersonAuthorizesDiscussion.setValidators([Validators.required]);
      authorizedPersonSignature.setValidators([Validators.required]);
    }
  }
  setRequiredFields() {
    // set all form validation
    this.setCompletingOnBehalfOf();
    this.setCvapStaffSharing();
    this.setHospitalTreatment();
    this.setPreferredContactMethod();
    this.setRepresentativePreferredMethodOfContact();
  }
}
