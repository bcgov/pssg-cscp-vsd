import { AEMService } from '../services/aem.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Application, Introduction, PersonalInformation, CrimeInformation, MedicalInformation, ExpenseInformation, EmploymentIncomeInformation, RepresentativeInformation, DeclarationInformation, AuthorizationInformation, VictimInformation } from '../interfaces/application.interface';
import { ApplicationType, OnBehalfOf } from '../shared/enums-list';
import { AuthInfoHelper } from '../shared/authorization-information/authorization-information.helper';
import { CancelDialog } from '../shared/dialogs/cancel/cancel.dialog';
import { Component, HostListener, OnInit } from '@angular/core';
import { CrimeInfoHelper } from '../shared/crime-information/crime-information.helper';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DeclarationInfoHelper } from '../shared/declaration-information/declaration-information.helper';
import { DocumentCollectioninformation } from '../interfaces/victim-restitution.interface';
import { ExpenseInfoHelper } from '../shared/expense-information/expense-information.helper';
import { FormBase } from '../shared/form-base';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { JusticeApplicationDataService } from '../services/justice-application-data.service';
import { LookupService } from '../services/lookup.service';
import { MY_FORMATS } from '../shared/enums-list';
import { MatSnackBar, MatDialog } from '@angular/material';
import { MatStepper } from '@angular/material/stepper';
import { MedicalInfoHelper } from '../shared/medical-information/medical-information.helper';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { PersonalInfoHelper } from '../shared/personal-information/personal-information.helper';
import { RepresentativeInfoHelper } from '../shared/representative-information/representative-information.helper';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { SummaryOfBenefitsDialog } from '../summary-of-benefits/summary-of-benefits.component';
import { VictimInfoHelper } from '../shared/victim-information/victim-information.helper';
import { config } from '../../config';
import { defaultFormat as _rollupMoment } from 'moment';
import { iLookupData } from '../models/lookup-data.model';
import * as _ from 'lodash';
import * as _moment from 'moment';

const moment = _rollupMoment || _moment;

@Component({
  selector: 'app-witness-application',
  templateUrl: './witness-application.component.html',
  styleUrls: ['./witness-application.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true } },
  ],
})

export class WitnessApplicationComponent extends FormBase implements OnInit {
  FORM_TYPE: ApplicationType = ApplicationType.Witness_Application;
  busy: Promise<any>;
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
    this.form = this.buildApplicationForm();

    let promise_array = [];

    promise_array.push(new Promise((resolve, reject) => {
      this.lookupService.getCountries().subscribe((res) => {
        this.lookupData.countries = res.value;
        if (this.lookupData.countries) {
          this.lookupData.countries.sort((a, b) => a.vsd_name.localeCompare(b.vsd_name));
        }
        resolve();
      });
    }));

    promise_array.push(new Promise((resolve, reject) => {
      this.lookupService.getProvinces().subscribe((res) => {
        this.lookupData.provinces = res.value;
        if (this.lookupData.provinces) {
          this.lookupData.provinces.sort((a, b) => a.vsd_name.localeCompare(b.vsd_name));
        }
        resolve();
      });
    }));

    promise_array.push(new Promise((resolve, reject) => {
      this.lookupService.getCitiesByProvince(config.canada_crm_id, config.bc_crm_id).subscribe((res) => {
        this.lookupData.cities = res.value;
        if (this.lookupData.cities) {
          this.lookupData.cities.sort((a, b) => a.vsd_name.localeCompare(b.vsd_name));
        }
        resolve();
      });
    }));

    Promise.all(promise_array).then((res) => {
      this.didLoad = true;
      console.log("Lookup data");
      console.log(this.lookupData);
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

  submitApplication() {
    this.submitting = true;
    if (this.form.valid) {
      this.getApplicationPDFs().then((pdfs: DocumentCollectioninformation[]) => {
        let form = this.harvestForm();
        form.ApplicationPDFs = pdfs;
        this.justiceDataService.submitApplication(form)
          .subscribe(
            data => {
              if (data['isSuccess'] == true) {
                this.router.navigate(['/application-success']);
              }
              else {
                this.submitting = false;
                this.snackBar.open('Error submitting application', 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
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
      EmploymentIncomeInformation: null as EmploymentIncomeInformation,
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

  private buildApplicationForm(): FormGroup {
    return this.fb.group({
      introduction: this.fb.group({
        understoodInformation: [null, Validators.requiredTrue]
      }),
      personalInformation: this.personalInfoHelper.setupFormGroup(this.fb, this.FORM_TYPE),
      victimInformation: this.victimInfoHelper.setupFormGroup(this.fb, this.FORM_TYPE),
      crimeInformation: this.crimeInfoHelper.setupFormGroup(this.fb, this.FORM_TYPE),
      medicalInformation: this.medicalInfoHelper.setupFormGroup(this.fb, this.FORM_TYPE),
      expenseInformation: this.expenseInfoHelper.setupFormGroup(this.fb, this.FORM_TYPE),
      representativeInformation: this.representativeInfoHelper.setupFormGroup(this.fb, this.FORM_TYPE),
      declarationInformation: this.declarationInfoHelper.setupFormGroup(this.fb, this.FORM_TYPE),
      authorizationInformation: this.authInfoHelper.setupFormGroup(this.fb, this.FORM_TYPE),
    });
  }

  @HostListener('window:afterprint')
  onafterprint() {
    document.querySelectorAll(".slide-close")[0].classList.remove("hide-for-print")
    window.scroll(0, 0);
    this.showPrintView = false;
  }

  downloadPDF() {
    this.getAEMPDF().then((pdf: string) => {
      let downloadLink = document.createElement("a");
      downloadLink.href = "data:application/pdf;base64," + pdf;
      downloadLink.download = "Witness-Application.pdf";
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
      this.aemService.getWitnessApplicationPDF(application).subscribe((res: any) => {
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

      promise_array.push(new Promise((resolve, reject) => {
        this.getAEMPDF().then((pdf: string) => {
          ret.push({
            body: pdf,
            filename: "Witness-Application.pdf",
            subject: "",
          });
          resolve();
        }).catch((err) => {
          console.log(err);
          reject();
        });
      }));

      promise_array.push(new Promise((resolve, reject) => {
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
}
