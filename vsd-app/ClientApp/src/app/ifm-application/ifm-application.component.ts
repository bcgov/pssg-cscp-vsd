import { AEMService } from '../services/aem.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Application, Introduction, PersonalInformation, CrimeInformation, MedicalInformation, ExpenseInformation, EmploymentIncomeInformation, RepresentativeInformation, DeclarationInformation, AuthorizationInformation, VictimInformation, DocumentCollectioninformation } from '../interfaces/application.interface';
import { ApplicationType, OnBehalfOf } from '../shared/enums-list';
import { AuthInfoHelper } from '../shared/authorization-information/authorization-information.helper';
import { CancelDialog } from '../shared/dialogs/cancel/cancel.dialog';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { CrimeInfoHelper } from '../shared/crime-information/crime-information.helper';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DeclarationInfoHelper } from '../shared/declaration-information/declaration-information.helper';
import { EmploymentInfoHelper } from '../shared/employment-information/employment-information.helper';
import { ExpenseInfoHelper } from '../shared/expense-information/expense-information.helper';
import { FormBase } from '../shared/form-base';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
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
import { defaultFormat as _rollupMoment } from 'moment';
import { iLookupData } from '../interfaces/lookup-data.interface';
import * as _ from 'lodash';
import * as _moment from 'moment';

const moment = _rollupMoment || _moment;

@Component({
  selector: 'app-ifm-application',
  templateUrl: './ifm-application.component.html',
  styleUrls: ['./ifm-application.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true } },
  ],
})

export class IfmApplicationComponent extends FormBase implements OnInit {
  @ViewChild('stepper') ifmStepper: MatVerticalStepper;
  FORM_TYPE = ApplicationType.IFM_Application;
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
    private dialog: MatDialog,
    public state: StateService,
    public lookupService: LookupService,
    private aemService: AEMService,
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
    this.submitting = true;
    if (this.form.valid) {
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
                console.log('Error submitting application');
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
                this.submitting = false;
                this.snackBar.open('Error submitting application. ' + data['message'], 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
                console.log('Error submitting application');
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
      EmploymentIncomeInformation: null as EmploymentIncomeInformation, // There is no EmploymentIncomeInformation in IFM
      RepresentativeInformation: this.form.get('representativeInformation').value as RepresentativeInformation,
      DeclarationInformation: this.form.get('declarationInformation').value as DeclarationInformation,
      AuthorizationInformation: this.form.get('authorizationInformation').value as AuthorizationInformation,
      VictimInformation: this.form.get('victimInformation').value as VictimInformation,
    } as Application;

    //using this as a workaround to collect values from disabled fields
    if (data.VictimInformation.mostRecentMailingAddressSameAsPersonal == true) {
      data.VictimInformation.primaryAddress = data.PersonalInformation.primaryAddress;
    }
    if (data.RepresentativeInformation.mostRecentMailingAddressSameAsPersonal == true) {
      data.RepresentativeInformation.representativeAddress = data.PersonalInformation.primaryAddress;
    }
    if (data.VictimInformation.victimSameContactInfo) {
      data.VictimInformation.phoneNumber = data.PersonalInformation.phoneNumber;
      data.VictimInformation.alternatePhoneNumber = data.PersonalInformation.alternatePhoneNumber;
      data.VictimInformation.email = data.PersonalInformation.email;
    }

    return data;
  }

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
      totalAttachmentSize: [0],
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
    document.querySelectorAll(".slide-close")[0].classList.remove("hide-for-print")
    window.scroll(0, 0);
    this.showPrintView = false;
  }

  printApplication() {
    window.scroll(0, 0);
    this.showPrintView = true;
    document.querySelectorAll(".slide-close")[0].classList.add("hide-for-print");
    setTimeout(() => {
      window.print();
    }, 100);
  }

  downloadPDF() {
    this.getAEMPDF().then((pdf: string) => {
      let downloadLink = document.createElement("a");
      downloadLink.href = "data:application/pdf;base64," + pdf;
      downloadLink.download = "IFM-Application.pdf";
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
      //sending large document info to aem causes it to crap out - it's also unnecessary info, so let's not send it!
      application.CrimeInformation.documents.forEach(doc => doc.body = "");
      application.RepresentativeInformation.documents.forEach(doc => doc.body = "");
      //full name display option for single fields
      application.PersonalInformation.fullName = application.PersonalInformation.firstName + " " + application.PersonalInformation.lastName;
      //display all locations as a single comma separated string
      application.CrimeInformation.crimeLocations[0].location = application.CrimeInformation.crimeLocations.map(a => a.location).join(', ');
      //for on behalf of, if you chose parent, pdf format doesn't match webform, so relationship workaround
      if (application.RepresentativeInformation.completingOnBehalfOf == OnBehalfOf.Parent) {
        application.RepresentativeInformation.relationshipToPersonParent = application.RepresentativeInformation.relationshipToPerson;
        application.RepresentativeInformation.relationshipToPerson = "";
      }
      this.aemService.getIFMApplicationPDF(application).subscribe((res: any) => {
        console.log(res);
        if (res.responseMessage) {
          resolve(res.responseMessage);
        }
        else {
          reject(res);
        }
      },
        (err) => {
          reject(err);
          console.log(err);
        });
    });
  }

  getAuthPDF(): Promise<string> {
    return new Promise((resolve, reject) => {
      let application: Application = _.cloneDeep(this.harvestForm());
      //sending large document info to aem causes it to crap out - it's also unnecessary info, so let's not send it!
      application.CrimeInformation.documents.forEach(doc => doc.body = "");
      application.RepresentativeInformation.documents.forEach(doc => doc.body = "");
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
      },
        (err) => {
          reject(err);
          console.log(err);
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
            filename: "IFM-Application.pdf",
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
