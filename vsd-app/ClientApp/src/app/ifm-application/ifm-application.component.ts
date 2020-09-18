import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatStepper, MatVerticalStepper } from '@angular/material/stepper';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
import { defaultFormat as _rollupMoment } from 'moment';
import { MatSnackBar, MatDialog } from '@angular/material';
import { SummaryOfBenefitsDialog } from '../summary-of-benefits/summary-of-benefits.component';
import { JusticeApplicationDataService } from '../services/justice-application-data.service';
import { FormBase } from '../shared/form-base';
import { ApplicationType } from '../shared/enums-list';
import { MY_FORMATS } from '../shared/enums-list';
import { Application, Introduction, PersonalInformation, CrimeInformation, MedicalInformation, ExpenseInformation, EmploymentIncomeInformation, RepresentativeInformation, DeclarationInformation, AuthorizationInformation, VictimInformation } from '../interfaces/application.interface';
import { CrimeInfoHelper } from '../shared/crime-information/crime-information.helper';
import { MedicalInfoHelper } from '../shared/medical-information/medical-information.helper';
import { AuthInfoHelper } from '../shared/authorization-information/authorization-information.helper';
import { VictimInfoHelper } from '../shared/victim-information/victim-information.helper';
import { PersonalInfoHelper } from '../shared/personal-information/personal-information.helper';
import { RepresentativeInfoHelper } from '../shared/representative-information/representative-information.helper';
import { ExpenseInfoHelper } from '../shared/expense-information/expense-information.helper';
import { DeclarationInfoHelper } from '../shared/declaration-information/declaration-information.helper';
import { Subscription } from 'rxjs';
import { CancelDialog } from '../shared/dialogs/cancel/cancel.dialog';
import { StateService } from '../services/state.service';
import * as _ from 'lodash';
import { EmploymentInfoHelper } from '../shared/employment-information/employment-information.helper';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';

const moment = _rollupMoment || _moment;

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
    { provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true } },
  ],
})

export class IfmApplicationComponent extends FormBase implements OnInit {
  @ViewChild('stepper') ifmStepper: MatVerticalStepper;
  FORM_TYPE = ApplicationType.IFM_Application;
  busy: Subscription;
  form: FormGroup;
  formFullyValidated: boolean;
  showValidationMessage: boolean;
  submitting: boolean = false;
  public showPrintView: boolean = false;

  public currentFormStep: number;

  saveFormData: any;

  ApplicationType = ApplicationType;

  personalInfoHelper = new PersonalInfoHelper();
  victimInfoHelper = new VictimInfoHelper();
  crimeInfoHelper = new CrimeInfoHelper();
  employmentInfoHelper = new EmploymentInfoHelper();
  medicalInfoHelper = new MedicalInfoHelper();
  expenseInfoHelper = new ExpenseInfoHelper();
  representativeInfoHelper = new RepresentativeInfoHelper();
  declarationInfoHelper = new DeclarationInfoHelper();
  authInfoHelper = new AuthInfoHelper();

  isIE: boolean = false;

  constructor(
    private justiceDataService: JusticeApplicationDataService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    public state: StateService,
  ) {
    super();
    this.formFullyValidated = false;
    this.currentFormStep = 0;
  }

  ngOnInit() {
    var ua = window.navigator.userAgent;
    this.isIE = /MSIE|Trident/.test(ua);

    let completeOnBehalfOf = this.route.snapshot.queryParamMap.get('ob');
    if (this.state.cloning) {
      this.form = this.state.data;
      this.state.cloning = false;
    }
    else {
      this.form = this.buildApplicationForm();
    }

    if (completeOnBehalfOf) {
      this.form.get('representativeInformation').patchValue({
        completingOnBehalfOf: parseInt(completeOnBehalfOf)
      });
    }
  }

  verifyCancellation(): void {
    let self = this;
    let dialogRef = this.dialog.open(CancelDialog, {
      autoFocus: false,
      data: { type: "Application" }
    });

    dialogRef.afterClosed().subscribe((res: any) => {
      if (res.cancel) {
        self.router.navigate(['/application-cancelled']);
      }
    });
  }

  showSummaryOfBenefits(): void {
    const summaryDialogRef = this.dialog.open(SummaryOfBenefitsDialog, { data: this.FORM_TYPE });
  }

  getFormGroupName(groupIndex: any) {
    let elements: Array<string> = ['introduction', 'personalInformation', 'victimInformation', 'crimeInformation', 'medicalInformation', 'expenseInformation', 'representativeInformation', 'declarationInformation', 'authorizationInformation'];
    return elements[groupIndex];
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
      console.log(`Form for validation is ${formGroupName}.`);

      this.formFullyValidated = this.form.valid;

      if (desiredFormIndex >= 0 && desiredFormIndex < 9) {
        var formParts = this.form.get(formGroupName);
        var formValid = true;

        if (formParts != null) {
          formValid = formParts.valid;
          console.log(formParts);
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

  submitApplication() {
    //let formIsValid = true;showValidationMessage
    // show the button as submitting and disable it
    this.submitting = true;
    if (this.form.valid) {
      this.busy = this.justiceDataService.submitApplication(this.harvestForm())
        .subscribe(
          data => {
            if (data['isSuccess'] == true) {
              this.router.navigate(['/application-success']);
            }
            else {
              // re-enable the button
              this.submitting = false;
              this.snackBar.open('Error submitting application. ' + data['message'], 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
              console.log('Error submitting application');
              if (this.isIE) {
                alert("Encountered an error. Please use another browser as this may resolve the problem.")
              }
            }
          },
          error => {
            // re-enable the button
            this.submitting = false;
            this.snackBar.open('Error submitting application', 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
            console.log('Error submitting application');
            if (this.isIE) {
              alert("Encountered an error. Please use another browser as this may resolve the problem.")
            }
          }
        );
    } else {
      // re-enable the button
      this.submitting = false;
      console.log("form not validated");
      this.markAsTouched();
    }
  }

  submitApplicationAndClone(type: string) {
    this.submitting = true;
    if (this.form.valid) {
      let thisForm = _.cloneDeep(this.form);
      this.busy = this.justiceDataService.submitApplication(this.harvestForm())
        .subscribe(
          data => {
            if (data['isSuccess'] == true) {
              if (type === "IFM") {
                this.submitting = false;
                let ifmForm = this.cloneFormToIFM(thisForm);
                this.ifmStepper.reset();

                this.form = ifmForm;
              }
              else if (type === "VICTIM") {
                this.submitting = false;

                let victimForm = this.cloneFormToVictim(thisForm);

                this.state.cloning = true;
                this.state.data = victimForm;

                this.router.navigate(['/victim-application']);
              }
              else {
                this.router.navigate(['/application-success']);
              }
            }
            else {
              // re-enable the button
              this.submitting = false;
              this.snackBar.open('Error submitting application. ' + data['message'], 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
              console.log('Error submitting application');
              if (this.isIE) {
                alert("Encountered an error. Please use another browser as this may resolve the problem.")
              }
            }
          },
          error => {
            // re-enable the button
            this.submitting = false;
            this.snackBar.open('Error submitting application', 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
            console.log('Error submitting application');
            if (this.isIE) {
              alert("Encountered an error. Please use another browser as this may resolve the problem.")
            }
          }
        );
    } else {
      // re-enable the button
      this.submitting = false;
      console.log("form not validated");
      this.markAsTouched();
    }
  }

  debugFormData(): void {
    let formData: Application = {
      ApplicationType: this.FORM_TYPE,
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
    let data = {
      ApplicationType: this.FORM_TYPE,
      Introduction: this.form.get('introduction').value as Introduction,
      PersonalInformation: this.form.get('personalInformation').value as PersonalInformation,
      CrimeInformation: this.form.get('crimeInformation').value as CrimeInformation,
      MedicalInformation: this.form.get('medicalInformation').value as MedicalInformation,
      ExpenseInformation: this.form.get('expenseInformation').value as ExpenseInformation,
      EmploymentIncomeInformation: null as EmploymentIncomeInformation, // There is no EmploymentIncomeInformation in IFM
      RepresentativeInformation: this.form.get('representativeInformation').value as RepresentativeInformation,
      DeclarationInformation: this.form.get('declarationInformation').value as DeclarationInformation,
      AuthorizationInformation: this.form.get('authorizationInformation').value as AuthorizationInformation,
      VictimInformation: this.form.get('victimInformation').value as VictimInformation,
    } as Application;

    if (data.VictimInformation.mostRecentMailingAddressSameAsPersonal == true) {
      data.VictimInformation.primaryAddress = data.PersonalInformation.primaryAddress;
    }

    return data;
  }

  // marking the form as touched makes the validation messages show
  markAsTouched() {
    this.form.markAsTouched();
  }

  private buildApplicationForm(FORM: ApplicationType = this.FORM_TYPE): FormGroup {
    let group = {
      introduction: this.fb.group({
        understoodInformation: [null, Validators.requiredTrue]
      }),
      personalInformation: this.personalInfoHelper.setupFormGroup(this.fb, FORM),
      crimeInformation: this.crimeInfoHelper.setupFormGroup(this.fb, FORM),
      medicalInformation: this.medicalInfoHelper.setupFormGroup(this.fb, FORM),
      expenseInformation: this.expenseInfoHelper.setupFormGroup(this.fb, FORM),
      representativeInformation: this.representativeInfoHelper.setupFormGroup(this.fb, FORM),
      declarationInformation: this.declarationInfoHelper.setupFormGroup(this.fb, FORM),
      authorizationInformation: this.authInfoHelper.setupFormGroup(this.fb, FORM),
    };

    if (FORM === ApplicationType.IFM_Application) {
      group["victimInformation"] = this.victimInfoHelper.setupFormGroup(this.fb, FORM);
    }

    if (FORM === ApplicationType.Victim_Application) {
      group["employmentIncomeInformation"] = this.employmentInfoHelper.setupFormGroup(this.fb, FORM);
    }

    return this.fb.group(group);
  }

  @HostListener('window:afterprint')
  onafterprint() {
    console.log("after print");
    document.querySelectorAll(".slide-close")[0].classList.remove("hide-for-print")
    window.scroll(0, 0);
    this.showPrintView = false;
  }

  producePDF() {
    console.log("attempt to print invoice");
    window.scroll(0, 0);
    this.showPrintView = true;
    document.querySelectorAll(".slide-close")[0].classList.add("hide-for-print");
    setTimeout(() => {
      window.print();
    }, 100);
  }

  cloneFormToVictim(currentForm) {
    console.log("cloning IFM to Victim");
    console.log(currentForm);
    let ret = this.buildApplicationForm(ApplicationType.Victim_Application);

    ret.get('personalInformation').patchValue(currentForm.get('personalInformation').value);
    ret.get('personalInformation').get('firstName').patchValue('');
    ret.get('personalInformation').get('middleName').patchValue('');
    ret.get('personalInformation').get('lastName').patchValue('');
    ret.get('personalInformation').get('iHaveOtherNames').patchValue('');
    ret.get('personalInformation').get('otherFirstName').patchValue('');
    ret.get('personalInformation').get('otherLastName').patchValue('');
    ret.get('personalInformation').get('dateOfNameChange').patchValue('');
    ret.get('personalInformation').get('gender').patchValue(0);
    ret.get('personalInformation').get('birthDate').patchValue('');
    ret.get('personalInformation').get('sin').patchValue('');
    ret.get('personalInformation').get('occupation').patchValue('');
    ret.get('personalInformation').get('indigenousStatus').patchValue(0);
    ret.get('personalInformation').get('permissionToContactViaMethod').patchValue(false);
    ret.get('personalInformation').get('agreeToCvapCommunicationExchange').patchValue('');
    ret.get('personalInformation').get('leaveVoicemail').patchValue(0);
    let crimeLocationsLength = currentForm.get('crimeInformation').get('crimeLocations').value.length;
    let crimeLocations = ret.get('crimeInformation').get('crimeLocations') as FormArray;
    let crimeDocumentsLength = currentForm.get('crimeInformation').get('documents').value.length;
    let crimeDocuments = ret.get('crimeInformation').get('documents') as FormArray;
    let policeReportsLength = currentForm.get('crimeInformation').get('policeReports').value.length;
    let policeReports = ret.get('crimeInformation').get('policeReports') as FormArray;

    for (let i = 0; i < crimeLocationsLength - 1; ++i) {
      crimeLocations.push(this.crimeInfoHelper.createCrimeLocationItem(this.fb));
    }

    for (let i = 0; i < crimeDocumentsLength; ++i) {
      crimeDocuments.push(this.fb.group({
        filename: [''],
        body: [''],
        subject: ['']
      }));
    }

    for (let i = 0; i < policeReportsLength; ++i) {
      policeReports.push(this.crimeInfoHelper.createPoliceReport(this.fb));
    }

    ret.get('crimeInformation').patchValue(currentForm.get('crimeInformation').value);
    ret.get('crimeInformation').get('unsureOfCrimeDates').patchValue('');
    ret.get('crimeInformation').get('whenDidCrimeOccur').patchValue('');
    ret.get('crimeInformation').get('crimePeriodStart').patchValue('');
    ret.get('crimeInformation').get('crimePeriodEnd').patchValue('');
    ret.get('crimeInformation').get('applicationFiledWithinOneYearFromCrime').patchValue('');
    ret.get('crimeInformation').get('whyDidYouNotApplySooner').patchValue('');
    ret.get('crimeInformation').get('crimeDetails').patchValue('');
    ret.get('crimeInformation').get('crimeInjuries').patchValue('');
    ret.get('crimeInformation').get('offenderRelationship').patchValue('');
    ret.get('crimeInformation').get('haveYouSuedOffender').patchValue(0);
    ret.get('crimeInformation').get('intendToSueOffender').patchValue(null);
    ret.get('crimeInformation').get('racafInformation').patchValue(this.crimeInfoHelper.createRACAFInformation(this.fb).value);
    ret.get('representativeInformation').patchValue(currentForm.get('representativeInformation').value);

    let authorizedPersonsLength = currentForm.get('authorizationInformation').get('authorizedPerson').value.length;
    let authorizedPersons = ret.get('authorizationInformation').get('authorizedPerson') as FormArray;

    for (let i = 0; i < authorizedPersonsLength; ++i) {
      authorizedPersons.push(this.authInfoHelper.createAuthorizedPerson(this.fb));
    }

    ret.get('authorizationInformation').patchValue(currentForm.get('authorizationInformation').value);
    ret.get('authorizationInformation').get('approvedAuthorityNotification').patchValue('');
    ret.get('authorizationInformation').get('readAndUnderstoodTermsAndConditions').patchValue('');
    ret.get('authorizationInformation').get('signature').patchValue('');
    ret.get('authorizationInformation').get('authorizedPersonAuthorizesDiscussion').patchValue('');
    ret.get('authorizationInformation').get('authorizedPersonSignature').patchValue('');

    return ret;
  }

  cloneFormToIFM(currentForm) {
    console.log("cloning IFM to IFM");
    console.log(currentForm);

    let ret = this.buildApplicationForm(ApplicationType.IFM_Application);

    ret.get('personalInformation').patchValue(currentForm.get('personalInformation').value);
    ret.get('personalInformation').get('firstName').patchValue('');
    ret.get('personalInformation').get('middleName').patchValue('');
    ret.get('personalInformation').get('lastName').patchValue('');
    ret.get('personalInformation').get('iHaveOtherNames').patchValue('');
    ret.get('personalInformation').get('otherFirstName').patchValue('');
    ret.get('personalInformation').get('otherLastName').patchValue('');
    ret.get('personalInformation').get('dateOfNameChange').patchValue('');
    ret.get('personalInformation').get('relationshipToVictim').patchValue('');
    ret.get('personalInformation').get('relationshipToVictimOther').patchValue('');
    ret.get('personalInformation').get('gender').patchValue(0);
    ret.get('personalInformation').get('birthDate').patchValue('');
    ret.get('personalInformation').get('sin').patchValue('');
    ret.get('personalInformation').get('occupation').patchValue('');
    ret.get('personalInformation').get('indigenousStatus').patchValue(0);
    ret.get('personalInformation').get('permissionToContactViaMethod').patchValue(false);
    ret.get('personalInformation').get('agreeToCvapCommunicationExchange').patchValue('');
    ret.get('personalInformation').get('leaveVoicemail').patchValue(0);
    

    ret.get('victimInformation').patchValue(currentForm.get('victimInformation').value);
    // ret.get('victimInformation').get('mostRecentMailingAddressSameAsPersonal').patchValue(true);
    let crimeLocationsLength = currentForm.get('crimeInformation').get('crimeLocations').value.length;
    let crimeLocations = ret.get('crimeInformation').get('crimeLocations') as FormArray;
    let crimeDocumentsLength = currentForm.get('crimeInformation').get('documents').value.length;
    let crimeDocuments = ret.get('crimeInformation').get('documents') as FormArray;
    let policeReportsLength = currentForm.get('crimeInformation').get('policeReports').value.length;
    let policeReports = ret.get('crimeInformation').get('policeReports') as FormArray;

    for (let i = 0; i < crimeLocationsLength - 1; ++i) {
      crimeLocations.push(this.crimeInfoHelper.createCrimeLocationItem(this.fb));
    }

    for (let i = 0; i < crimeDocumentsLength; ++i) {
      crimeDocuments.push(this.fb.group({
        filename: [''],
        body: [''],
        subject: ['']
      }));
    }

    for (let i = 0; i < policeReportsLength; ++i) {
      policeReports.push(this.crimeInfoHelper.createPoliceReport(this.fb));
    }

    ret.get('crimeInformation').patchValue(currentForm.get('crimeInformation').value);
    ret.get('crimeInformation').get('offenderRelationship').patchValue('');
    ret.get('crimeInformation').get('haveYouSuedOffender').patchValue(0);
    ret.get('crimeInformation').get('intendToSueOffender').patchValue(null);
    ret.get('crimeInformation').get('racafInformation').patchValue(this.crimeInfoHelper.createRACAFInformation(this.fb).value);
    ret.get('representativeInformation').patchValue(currentForm.get('representativeInformation').value);

    let authorizedPersonsLength = currentForm.get('authorizationInformation').get('authorizedPerson').value.length;
    let authorizedPersons = ret.get('authorizationInformation').get('authorizedPerson') as FormArray;
    console.log("authorizedPersonsLength: ", authorizedPersonsLength);

    for (let i = 0; i < authorizedPersonsLength; ++i) {
      authorizedPersons.push(this.authInfoHelper.createAuthorizedPerson(this.fb));
    }

    console.log(authorizedPersons);

    ret.get('authorizationInformation').patchValue(currentForm.get('authorizationInformation').value);
    ret.get('authorizationInformation').get('approvedAuthorityNotification').patchValue('');
    ret.get('authorizationInformation').get('readAndUnderstoodTermsAndConditions').patchValue('');
    ret.get('authorizationInformation').get('signature').patchValue('');
    ret.get('authorizationInformation').get('authorizedPersonAuthorizesDiscussion').patchValue('');
    ret.get('authorizationInformation').get('authorizedPersonSignature').patchValue('');

    return ret;
  }
}
