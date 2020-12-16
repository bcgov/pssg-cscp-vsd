import { AEMService } from '../services/aem.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Application, Introduction, PersonalInformation, CrimeInformation, MedicalInformation, ExpenseInformation, EmploymentIncomeInformation, RepresentativeInformation, DeclarationInformation, AuthorizationInformation } from '../interfaces/application.interface';
import { ApplicationType, OnBehalfOf } from '../shared/enums-list';
import { AuthInfoHelper } from '../shared/authorization-information/authorization-information.helper';
import { CancelDialog } from '../shared/dialogs/cancel/cancel.dialog';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { CrimeInfoHelper } from '../shared/crime-information/crime-information.helper';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DeclarationInfoHelper } from '../shared/declaration-information/declaration-information.helper';
import { DocumentCollectioninformation } from '../interfaces/victim-restitution.interface';
import { EmploymentInfoHelper } from '../shared/employment-information/employment-information.helper';
import { ExpenseInfoHelper } from '../shared/expense-information/expense-information.helper';
import { FormBase } from '../shared/form-base';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { JusticeApplicationDataService } from '../services/justice-application-data.service';
import { LookupService } from '../services/lookup.service';
import { MY_FORMATS } from '../shared/enums-list';
import { MatSnackBar, MatDialog } from '@angular/material';
import { MatStepper, MatVerticalStepper } from '@angular/material/stepper';
import { MedicalInfoHelper } from '../shared/medical-information/medical-information.helper';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { PersonalInfoHelper } from '../shared/personal-information/personal-information.helper';
import { RepresentativeInfoHelper } from '../shared/representative-information/representative-information.helper';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { StateService } from '../services/state.service';
import { SummaryOfBenefitsDialog } from '../summary-of-benefits/summary-of-benefits.component';
import { VictimInfoHelper } from '../shared/victim-information/victim-information.helper';
import { config } from '../../config';
import { iLookupData } from '../models/lookup-data.model';
import { window } from 'ngx-bootstrap';
import * as _ from 'lodash';

@Component({
  selector: 'app-victim-application',
  templateUrl: './victim-application.component.html',
  styleUrls: ['./victim-application.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true } },
  ],
})

export class VictimApplicationComponent extends FormBase implements OnInit {
  @ViewChild('stepper') victimStepper: MatVerticalStepper;
  FORM_TYPE = ApplicationType.Victim_Application;
  busy: Promise<any>;
  showValidationMessage: boolean;
  submitting: boolean = false;
  public showPrintView: boolean = false;

  public currentFormStep: number = 0;

  saveFormData: any;

  ApplicationType = ApplicationType;

  personalInfoHelper = new PersonalInfoHelper();
  victimInfoHelper = new VictimInfoHelper();
  crimeInfoHelper = new CrimeInfoHelper();
  medicalInfoHelper = new MedicalInfoHelper();
  employmentInfoHelper = new EmploymentInfoHelper();
  expenseInfoHelper = new ExpenseInfoHelper();
  representativeInfoHelper = new RepresentativeInfoHelper();
  declarationInfoHelper = new DeclarationInfoHelper();
  authInfoHelper = new AuthInfoHelper();

  isIE: boolean = false;
  didLoad: boolean = false;

  lookupData: iLookupData = {
    countries: [],
    provinces: [],
    cities: [],
    relationships: [],
    representativeRelationships: [],
    courts: [],
    police_detachments: [],
  };

  constructor(
    private justiceDataService: JusticeApplicationDataService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public snackBar: MatSnackBar,
    private matDialog: MatDialog,
    public state: StateService,
    public lookupService: LookupService,
    private aemService: AEMService,
  ) {
    super();
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

    let promise_array = [];

    promise_array.push(new Promise<void>((resolve, reject) => {
      this.lookupService.getCountries().subscribe((res) => {
        this.lookupData.countries = res.value;
        if (this.lookupData.countries) {
          this.lookupData.countries.sort((a, b) => a.vsd_name.localeCompare(b.vsd_name));
        }
        resolve();
      });
    }));

    promise_array.push(new Promise<void>((resolve, reject) => {
      this.lookupService.getProvinces().subscribe((res) => {
        this.lookupData.provinces = res.value;
        if (this.lookupData.provinces) {
          this.lookupData.provinces.sort((a, b) => a.vsd_name.localeCompare(b.vsd_name));
        }
        resolve();
      });
    }));

    promise_array.push(new Promise<void>((resolve, reject) => {
      this.lookupService.getCitiesByProvince(config.canada_crm_id, config.bc_crm_id).subscribe((res) => {
        this.lookupData.cities = res.value;
        if (this.lookupData.cities) {
          this.lookupData.cities.sort((a, b) => a.vsd_name.localeCompare(b.vsd_name));
        }
        resolve();
      });
    }));

    promise_array.push(new Promise<void>((resolve, reject) => {
      this.lookupService.getRepresentativeRelationships().subscribe((res) => {
        this.lookupData.representativeRelationships = res.value;
        if (this.lookupData.representativeRelationships) {
          this.lookupData.representativeRelationships.sort((a, b) => a.vsd_name.localeCompare(b.vsd_name));
        }
        resolve();
      });
    }));

    Promise.all(promise_array).then((res) => {
      this.didLoad = true;
      // console.log("Lookup data");
      // console.log(this.lookupData);
    });


    if (completeOnBehalfOf) {
      this.form.get('representativeInformation').patchValue({
        completingOnBehalfOf: parseInt(completeOnBehalfOf)
      });
    }
  }

  buildApplicationForm(FORM: ApplicationType = this.FORM_TYPE): FormGroup {
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

  showSummaryOfBenefits(): void {
    const summaryDialogRef = this.matDialog.open(SummaryOfBenefitsDialog, { data: this.FORM_TYPE });
  }
  verifyCancellation(): void {
    let self = this;
    let dialogRef = this.matDialog.open(CancelDialog, {
      autoFocus: false,
      data: { type: "Application" }
    });

    dialogRef.afterClosed().subscribe((res: any) => {
      if (res.cancel) {
        self.router.navigate(['/application-cancelled']);
      }
    });
  }

  gotoPage(selectPage: MatStepper): void {
    // When a user clicks on the stepper this is triggered
    window.scroll(0, 0);
    this.showValidationMessage = false;
    this.currentFormStep = selectPage.selectedIndex;
  }

  gotoNextStep(stepper: MatStepper, emptyPage?: boolean): void {
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

        // Ensure if the page is empty that the form is valid
        if (emptyPage != null) {
          if (emptyPage == true) {
            formValid = true;
            //formParts.valid = true;
          }
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

  downloadPDF() {
    this.getAEMPDF().then((pdf: string) => {
      let downloadLink = document.createElement("a");
      downloadLink.href = "data:application/pdf;base64," + pdf;
      downloadLink.download = "Victim-Application.pdf";
      downloadLink.target = "_blank";

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }).catch((err) => {
      console.log("error getting pdf");
      console.log(err);
    });
  }

  getAEMPDF(): Promise<string> {
    return new Promise((resolve, reject) => {
      let application: Application = _.cloneDeep(this.harvestForm());
      //full name display option for single fields
      application.PersonalInformation.fullName = application.PersonalInformation.firstName + " " + application.PersonalInformation.lastName;
      //display all locations as a single comma separated string
      application.CrimeInformation.crimeLocations[0].location = application.CrimeInformation.crimeLocations.map(a => a.location).join(', ');
      //for on behalf of, if you chose parent, pdf format doesn't match webform, so relationship workaround
      if (application.RepresentativeInformation.completingOnBehalfOf == OnBehalfOf.Parent) {
        application.RepresentativeInformation.relationshipToPersonParent = application.RepresentativeInformation.relationshipToPerson;
        application.RepresentativeInformation.relationshipToPerson = "";
      }
      this.aemService.getVictimApplicationPDF(application).subscribe((res: any) => {
        console.log(res);
        if (res.responseMessage) {
          resolve(res.responseMessage);
        }
        else {
          reject(res);
        }
      });
    });
  }

  getAuthPDF(): Promise<string> {
    return new Promise((resolve, reject) => {
      let application: Application = _.cloneDeep(this.harvestForm());
      //full name display option for single fields
      application.PersonalInformation.fullName = application.PersonalInformation.firstName + " " + application.PersonalInformation.lastName;
      this.aemService.getAuthorizationPDF(application).subscribe((res: any) => {
        console.log(res);
        if (res.responseMessage) {
          resolve(res.responseMessage);
        }
        else {
          reject(res);
        }
      });
    });
  }

  getApplicationPDFs() {
    return new Promise(async (resolve, reject) => {
      let ret: DocumentCollectioninformation[] = [];
      let promise_array = [];

      promise_array.push(new Promise<void>((resolve, reject) => {
        this.getAEMPDF().then((pdf: string) => {
          ret.push({
            body: pdf,
            filename: "Victim-Application.pdf",
            subject: "",
          });
          resolve();
        }).catch((err) => {
          console.log(err);
          reject();
        });
      }));

      promise_array.push(new Promise<void>((resolve, reject) => {
        this.getAuthPDF().then((auth_pdf: string) => {
          ret.push({
            body: auth_pdf,
            filename: "Authorization Form.pdf",
            subject: "",
          });
          resolve();
        }).catch((err) => {
          console.log(err);
          reject();
        });
      }));

      Promise.all(promise_array).then((res) => {
        resolve(ret);
      }).catch((err) => {
        console.log(err);
        reject(err);
      });
    });
  }

  printApplication() {
    window.scroll(0, 0);
    this.showPrintView = true;
    document.querySelectorAll(".slide-close")[0].classList.add("hide-for-print");
    setTimeout(() => {
      window.print();
    }, 100);
  }

  @HostListener('window:afterprint')
  onafterprint() {
    document.querySelectorAll(".slide-close")[0].classList.remove("hide-for-print")
    window.scroll(0, 0);
    this.showPrintView = false;
  }

  submitApplication() {
    this.submitting = true;
    if ((this.form.valid) || (this.form.controls.personalInformation.valid // It's OK if this.form.controls.employmentIncomeInformation.valid is not valid
      && this.form.controls.crimeInformation.valid
      && this.form.controls.declarationInformation.valid
      && this.form.controls.expenseInformation.valid
      && this.form.controls.introduction.valid
      && this.form.controls.medicalInformation.valid
      && this.form.controls.personalInformation.valid
      && this.form.controls.representativeInformation.valid)) {
      this.getApplicationPDFs().then((pdfs: DocumentCollectioninformation[]) => {
        let form = this.harvestForm();
        form.ApplicationPDFs = pdfs;
        this.justiceDataService.submitApplication(form)
          .subscribe(
            data => {
              if (data['IsSuccess'] == true) {
                this.router.navigate(['/application-success']);
              }
              else {
                this.submitting = false;
                this.snackBar.open('Error submitting application. ' + data['message'], 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
                console.log('Error submitting application. ' + data['message']);
                if (this.isIE) {
                  alert("Encountered an error. Please use another browser as this may resolve the problem.")
                }
              }
            },
            error => {
              this.submitting = false;
              this.snackBar.open('Error submitting application', 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
              console.log('Error submitting application');
              if (this.isIE) {
                alert("Encountered an error. Please use another browser as this may resolve the problem.")
              }
            }
          );
      }).catch((err) => {
        this.submitting = false;
        this.snackBar.open('Error submitting application. ', 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
        console.log('Error submitting application. Problem getting AEM pdfs...');
        console.log(err);
      });
    } else {
      this.submitting = false;
      console.log("form not validated");
      this.markAsTouched();
    }
  }

  submitApplicationAndClone(type: string) {
    this.submitting = true;
    if (this.form.valid) {
      let thisForm = _.cloneDeep(this.form);
      this.getApplicationPDFs().then((pdfs: DocumentCollectioninformation[]) => {
        let form = this.harvestForm();
        form.ApplicationPDFs = pdfs;
        this.justiceDataService.submitApplication(form)
          .subscribe(
            data => {
              if (data['IsSuccess'] == true) {
                if (type === "VICTIM") {
                  this.submitting = false;
                  let victimForm = this.cloneFormToVictim(thisForm);
                  this.victimStepper.reset();

                  this.form = victimForm;
                }
                else if (type === "IFM") {
                  this.submitting = false;
                  let ifmForm = this.cloneFormToIFM(thisForm);

                  this.state.cloning = true;
                  this.state.data = ifmForm;

                  this.router.navigate(['/ifm-application']);
                }
                else {
                  this.router.navigate(['/application-success']);
                }
              }
              else {
                this.submitting = false;
                this.snackBar.open('Error submitting application. ' + data['message'], 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
                console.log('Error submitting application. ' + data['message']);
                if (this.isIE) {
                  alert("Encountered an error. Please use another browser as this may resolve the problem.")
                }
              }
            },
            error => {
              this.submitting = false;
              this.snackBar.open('Error submitting application', 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
              console.log('Error submitting application');
              if (this.isIE) {
                alert("Encountered an error. Please use another browser as this may resolve the problem.")
              }
            }
          );
      }).catch((err) => {
        this.submitting = false;
        this.snackBar.open('Error submitting application. ', 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
        console.log('Error submitting application. Problem getting AEM pdfs...');
        console.log(err);
      })
    } else {
      this.submitting = false;
      console.log("form not validated");
      this.markAsTouched();
    }
  }

  harvestForm(): Application {
    let data = {
      ApplicationType: this.FORM_TYPE,
      ApplicationDate: new Date(),
      ApplicationPDFs: [],
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

    //using this as a workaround to collect values from disabled fields
    if (data.RepresentativeInformation.mostRecentMailingAddressSameAsPersonal == true) {
      data.RepresentativeInformation.representativeAddress = data.PersonalInformation.primaryAddress;
    }

    return data;
  }


  save(): void {
    this.justiceDataService.submitApplication(this.harvestForm())
      .subscribe(
        data => { },
        err => { }
      );
  }

  markAsTouched() {
    this.form.markAsTouched();
  }

  cloneFormToVictim(currentForm) {
    console.log("cloning Victim to Victim");
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
    ret.get('personalInformation').get('maritalStatus').patchValue(0);
    ret.get('personalInformation').get('sin').patchValue('');
    ret.get('personalInformation').get('occupation').patchValue('');
    ret.get('personalInformation').get('indigenousStatus').patchValue(0);
    ret.get('personalInformation').get('permissionToContactViaMethod').patchValue(false);
    ret.get('personalInformation').get('agreeToCvapCommunicationExchange').patchValue('');
    ret.get('personalInformation').get('leaveVoicemail').patchValue(0);
    let crimeLocationsLength = currentForm.get('crimeInformation').get('crimeLocations').value.length;
    let crimeLocations = ret.get('crimeInformation').get('crimeLocations') as FormArray;
    let policeReportsLength = currentForm.get('crimeInformation').get('policeReports').value.length;
    let policeReports = ret.get('crimeInformation').get('policeReports') as FormArray;

    for (let i = 0; i < crimeLocationsLength - 1; ++i) {
      crimeLocations.push(this.crimeInfoHelper.createCrimeLocationItem(this.fb));
    }

    for (let i = 0; i < policeReportsLength; ++i) {
      policeReports.push(this.crimeInfoHelper.createPoliceReport(this.fb));
    }

    ret.get('crimeInformation').patchValue(currentForm.get('crimeInformation').value);
    ret.get('crimeInformation').get('overOneYearFromCrime').patchValue('');
    ret.get('crimeInformation').get('whyDidYouNotApplySooner').patchValue('');
    ret.get('crimeInformation').get('crimeDetails').patchValue('');
    ret.get('crimeInformation').get('crimeInjuries').patchValue('');
    ret.get('crimeInformation').get('offenderRelationship').patchValue('');
    ret.get('crimeInformation').get('haveYouSuedOffender').patchValue(0);
    ret.get('crimeInformation').get('intendToSueOffender').patchValue(null);
    ret.get('crimeInformation').get('racafInformation').patchValue(this.crimeInfoHelper.createRACAFInformation(this.fb).value);

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
    console.log("cloning Victim to IFM");
    console.log(currentForm);
    let ret = this.buildApplicationForm(ApplicationType.IFM_Application);

    ret.get('personalInformation').get('preferredMethodOfContact').patchValue(currentForm.get('personalInformation').get('preferredMethodOfContact').value);
    ret.get('personalInformation').get('permissionToContactViaMethod').patchValue(currentForm.get('personalInformation').get('permissionToContactViaMethod').value);
    ret.get('personalInformation').get('agreeToCvapCommunicationExchange').patchValue(currentForm.get('personalInformation').get('agreeToCvapCommunicationExchange').value);
    ret.get('personalInformation').get('phoneNumber').patchValue(currentForm.get('personalInformation').get('phoneNumber').value);
    ret.get('personalInformation').get('leaveVoicemail').patchValue(currentForm.get('personalInformation').get('leaveVoicemail').value);
    ret.get('personalInformation').get('alternatePhoneNumber').patchValue(currentForm.get('personalInformation').get('alternatePhoneNumber').value);
    ret.get('personalInformation').get('email').patchValue(currentForm.get('personalInformation').get('email').value);
    ret.get('personalInformation').get('confirmEmail').patchValue(currentForm.get('personalInformation').get('confirmEmail').value);
    ret.get('personalInformation').get('doNotLiveAtAddress').patchValue(currentForm.get('personalInformation').get('doNotLiveAtAddress').value);
    ret.get('personalInformation').get('mailRecipient').patchValue(currentForm.get('personalInformation').get('mailRecipient').value);
    ret.get('personalInformation').get('primaryAddress').patchValue(currentForm.get('personalInformation').get('primaryAddress').value);
    ret.get('personalInformation').get('alternateAddress').patchValue(currentForm.get('personalInformation').get('alternateAddress').value);

    ret.get('victimInformation').patchValue(currentForm.get('personalInformation').value);

    let crimeLocationsLength = currentForm.get('crimeInformation').get('crimeLocations').value.length;
    let crimeLocations = ret.get('crimeInformation').get('crimeLocations') as FormArray;
    let policeReportsLength = currentForm.get('crimeInformation').get('policeReports').value.length;
    let policeReports = ret.get('crimeInformation').get('policeReports') as FormArray;
    let courtFilesLength = currentForm.get('crimeInformation').get('courtFiles').value.length;
    let courtFiles = ret.get('crimeInformation').get('courtFiles') as FormArray;

    for (let i = 0; i < crimeLocationsLength - 1; ++i) {
      crimeLocations.push(this.crimeInfoHelper.createCrimeLocationItem(this.fb));
    }

    for (let i = 0; i < policeReportsLength; ++i) {
      policeReports.push(this.crimeInfoHelper.createPoliceReport(this.fb));
    }

    for (let i = 0; i < courtFilesLength; ++i) {
      courtFiles.push(this.crimeInfoHelper.createCourtInfoItem(this.fb));
    }

    ret.get('crimeInformation').patchValue(currentForm.get('crimeInformation').value);
    ret.get('crimeInformation').get('crimeInjuries').patchValue('');
    ret.get('crimeInformation').get('offenderRelationship').patchValue('');
    ret.get('crimeInformation').get('haveYouSuedOffender').patchValue(0);
    ret.get('crimeInformation').get('intendToSueOffender').patchValue(null);
    ret.get('crimeInformation').get('racafInformation').patchValue(this.crimeInfoHelper.createRACAFInformation(this.fb).value);

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
}
