import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
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
import { CancelDialog } from '../shared/dialogs/cancel/cancel.dialog';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';

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
  submitting: boolean = false; // this controls the button state for

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

  constructor(
    private justiceDataService: JusticeApplicationDataService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
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
    //const summaryDialogConfig = new MatDialogConfig();
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
      ExpenseInformation: null,//this.form.get('expenseInformation').value,
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
      ApplicationType: this.FORM_TYPE,
      Introduction: this.form.get('introduction').value as Introduction,
      PersonalInformation: this.form.get('personalInformation').value as PersonalInformation,
      CrimeInformation: this.form.get('crimeInformation').value as CrimeInformation,
      MedicalInformation: this.form.get('medicalInformation').value as MedicalInformation,
      ExpenseInformation: this.form.get('expenseInformation').value as ExpenseInformation,
      EmploymentIncomeInformation: null as EmploymentIncomeInformation,// this.form.get('employmentIncomeInformation').value as EmploymentIncomeInformation, // No employement information in Witness applications
      RepresentativeInformation: this.form.get('representativeInformation').value as RepresentativeInformation,
      DeclarationInformation: this.form.get('declarationInformation').value as DeclarationInformation,
      AuthorizationInformation: this.form.get('authorizationInformation').value as AuthorizationInformation,
      VictimInformation: this.form.get('victimInformation').value as VictimInformation,
    } as Application;
  }

  // marking the form as touched makes the validation messages show
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
}
