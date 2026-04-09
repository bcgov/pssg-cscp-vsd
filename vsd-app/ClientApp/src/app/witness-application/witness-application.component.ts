import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { ApplicationDraftsService } from '../../api/application-drafts/application-drafts.service';
import { JusticeService } from '../../api/justice/justice.service';
import { CreateApplicationDraftRequest, UpdateApplicationDraftRequest } from '../../model';
import {
  Application,
  AuthorizationInformation,
  CrimeInformation,
  DeclarationInformation,
  DocumentCollectioninformation,
  EmploymentIncomeInformation,
  ExpenseInformation,
  Introduction,
  MedicalInformation,
  PersonalInformation,
  RepresentativeInformation,
  VictimInformation
} from '../interfaces/application.interface';
import { AEMService } from '../services/aem.service';
import { AuthInfoHelper } from '../shared/authorization-information/authorization-information.helper';
import { CrimeInfoHelper } from '../shared/crime-information/crime-information.helper';
import { DeclarationInfoHelper } from '../shared/declaration-information/declaration-information.helper';
import { CancelDialog } from '../shared/dialogs/cancel/cancel.dialog';
import { ApplicationType, MY_FORMATS, OnBehalfOf } from '../shared/enums-list';
import { ExpenseInfoHelper } from '../shared/expense-information/expense-information.helper';
import { FormBase } from '../shared/form-base';
import { MedicalInfoHelper } from '../shared/medical-information/medical-information.helper';
import { PersonalInfoHelper } from '../shared/personal-information/personal-information.helper';
import { RepresentativeInfoHelper } from '../shared/representative-information/representative-information.helper';
import { ServiceNotAvailableComponent } from '../shared/service-not-available.component';
import { VictimInfoHelper } from '../shared/victim-information/victim-information.helper';
import { LookupStore } from '../store/lookup.store';
import { SummaryOfBenefitsDialog } from '../summary-of-benefits/summary-of-benefits.component';
import { LoginService } from '../services/login.service';

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
    { provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true } }
  ],
  standalone: false
})
export class WitnessApplicationComponent extends FormBase implements OnInit {
  FORM_TYPE: ApplicationType = ApplicationType.Witness_Application;
  busy: Promise<any>;
  form: UntypedFormGroup;
  formFullyValidated: boolean;
  showValidationMessage: boolean;
  submitting: boolean = false;
  public showPrintView: boolean = false;

  public currentFormStep: number;
  saveFormData: any;
  draftId: string | null = null;
  saving = false;
  draftSavedMessage = '';

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
  protected readonly lookupStore = inject(LookupStore);

  get canSaveDraft(): boolean {
    return this.authService.isAuthenticated.value;
  }

  constructor(
    private justiceService: JusticeService,
    private draftsService: ApplicationDraftsService,
    private fb: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private aemService: AEMService,
    private authService: LoginService
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

    // Load existing draft if draftId query param is present
    const draftId = this.route.snapshot.queryParamMap.get('draftId');
    if (draftId) {
      this.loadDraft(draftId);
    }

    this.form.valueChanges.subscribe(() => {
      const currentFormGroupName = this.getFormGroupName(this.currentFormStep);
      const currentFormGroup = this.form.get(currentFormGroupName);
      this.showValidationMessage = this.hasInvalidTouchedControls(currentFormGroup);
    });
  }

  verifyCancellation(): void {
    let self = this;
    let dialogRef = this.dialog.open(CancelDialog, {
      autoFocus: false,
      data: { type: 'Application' }
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
    let elements: Array<string> = [
      'introduction',
      'personalInformation',
      'victimInformation',
      'crimeInformation',
      'medicalInformation',
      'expenseInformation',
      'representativeInformation',
      'declarationInformation',
      'authorizationInformation'
    ];
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

          // if form has sin field, validate it specifically
          const sinControl = formParts.get('sin');
          if (sinControl != null) {
            const isRequired = sinControl.hasValidator(Validators.required);
            formValid = formValid && this.validateSIN(sinControl.value, isRequired);
          }
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

  private submit(form: Application): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getApplicationPDFs()
        .then((pdfs: DocumentCollectioninformation[]) => {
          form.ApplicationPDFs = pdfs;
          this.justiceService.postApiJusticeSaveapplication(form as any).subscribe({
            next: (data) => {
              resolve();
            },
            error: (error) => {
              reject();
            }
          });
        })
        .catch((err) => {
          reject();
        });
    });
  }

  private submitErrorHandler() {
    this.snackBar.openFromComponent(ServiceNotAvailableComponent, {
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  submitApplication() {
    this.markAsTouched();

    if (this.form.valid) {
      this.submitting = true;
      let form = this.harvestForm();
      this.submit(form)
        .then(() => {
          this.router.navigate(['/application-success']);
        })
        .catch(() => {
          this.submitErrorHandler();
        })
        .finally(() => {
          this.submitting = false;
        });
    } else {
      this.submitting = false;
    }
  }

  harvestForm(): Application {
    let data = {
      ApplicationType: this.FORM_TYPE,
      ApplicationDate: new Date(),
      ApplicationPDFs: [],
      DraftId: this.draftId,
      Introduction: this.form.get('introduction').value as Introduction,
      PersonalInformation: this.form.get('personalInformation').value as PersonalInformation,
      CrimeInformation: this.form.get('crimeInformation').value as CrimeInformation,
      MedicalInformation: this.form.get('medicalInformation').value as MedicalInformation,
      ExpenseInformation: this.form.get('expenseInformation').value as ExpenseInformation,
      EmploymentIncomeInformation: null as EmploymentIncomeInformation,
      RepresentativeInformation: this.form.get('representativeInformation').value as RepresentativeInformation,
      DeclarationInformation: this.form.get('declarationInformation').value as DeclarationInformation,
      AuthorizationInformation: this.form.get('authorizationInformation').value as AuthorizationInformation,
      VictimInformation: this.form.get('victimInformation').value as VictimInformation
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

  /** Save current form state as a draft via the ApplicationDrafts API. */
  saveDraft(): void {
    this.saving = true;
    this.draftSavedMessage = '';
    const formData = JSON.stringify(this.form.getRawValue());

    if (this.draftId) {
      const request: UpdateApplicationDraftRequest = { formData };
      this.draftsService.putApiApplicationDraftsDraftId(this.draftId, request).subscribe({
        next: () => {
          this.saving = false;
          this.draftSavedMessage = 'Draft saved.';
          this.snackBar.open('Draft saved successfully.', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.saving = false;
          this.snackBar.open('Failed to save draft.', 'Close', { duration: 5000 });
          console.error('Failed to update draft', err);
        }
      });
    } else {
      const request: CreateApplicationDraftRequest = {
        draftType: 100000002, // WitnessApplication
        formData
      };
      this.draftsService.postApiApplicationDrafts<{ success: boolean; draftId: string }>(request).subscribe({
        next: (res) => {
          this.saving = false;
          if (res?.draftId) {
            this.draftId = res.draftId;
            this.router.navigate([], {
              queryParams: { draftId: res.draftId },
              queryParamsHandling: 'merge',
              replaceUrl: true
            });
            this.draftSavedMessage = 'Draft saved.';
            this.snackBar.open('Draft saved successfully.', 'Close', { duration: 3000 });
          }
        },
        error: (err) => {
          this.saving = false;
          this.snackBar.open('Failed to save draft.', 'Close', { duration: 5000 });
          console.error('Failed to create draft', err);
        }
      });
    }
  }

  /** Load a draft by ID and restore form state. */
  private loadDraft(draftId: string): void {
    this.draftsService.getApiApplicationDraftsDraftId<any>(draftId).subscribe({
      next: (draft) => {
        if (draft?.draftData) {
          try {
            const savedData = JSON.parse(draft.draftData);
            this.restoreFormData(savedData);
            this.draftId = draftId;
            this.snackBar.open('Draft loaded.', 'Close', { duration: 3000 });
          } catch (e) {
            console.error('Failed to parse draft data', e);
            this.snackBar.open('Failed to parse draft data.', 'Close', { duration: 5000 });
          }
        }
      },
      error: (err) => {
        console.error('Failed to load draft', err);
        this.snackBar.open('Failed to load draft.', 'Close', { duration: 5000 });
      }
    });
  }

  /** Restore saved form data onto the reactive form, handling FormArrays. */
  private restoreFormData(savedData: any): void {
    this.resizeFormArray('crimeInformation', 'crimeLocations', savedData, () =>
      this.crimeInfoHelper.createCrimeLocationItem(this.fb)
    );
    this.resizeFormArray('crimeInformation', 'policeReports', savedData, () =>
      this.crimeInfoHelper.createPoliceReport(this.fb)
    );
    this.resizeFormArray('crimeInformation', 'courtFiles', savedData, () =>
      this.crimeInfoHelper.createCourtInfoItem(this.fb)
    );
    this.resizeFormArray('crimeInformation', 'additionalOffenders', savedData, () =>
      this.crimeInfoHelper.createAdditionalOffender(this.fb)
    );
    this.resizeFormArray('authorizationInformation', 'authorizedPerson', savedData, () =>
      this.authInfoHelper.createAuthorizedPerson(this.fb)
    );

    this.form.patchValue(savedData);
  }

  /** Ensure a FormArray has the correct number of items to accept patchValue data. */
  private resizeFormArray(groupName: string, arrayName: string, savedData: any, createFn: () => any): void {
    const savedArray = savedData?.[groupName]?.[arrayName];
    if (!Array.isArray(savedArray)) return;

    const formGroup = this.form.get(groupName);
    if (!formGroup) return;

    const formArray = formGroup.get(arrayName) as UntypedFormArray;
    if (!formArray) return;

    while (formArray.length < savedArray.length) {
      formArray.push(createFn());
    }
    while (formArray.length > savedArray.length) {
      formArray.removeAt(formArray.length - 1);
    }
  }

  private buildApplicationForm(): UntypedFormGroup {
    return this.fb.group({
      introduction: this.fb.group({
        understoodInformation: [null, Validators.requiredTrue]
      }),
      personalInformation: this.personalInfoHelper.setupFormGroup(this.fb, this.FORM_TYPE),
      victimInformation: this.victimInfoHelper.setupFormGroupForWitnessApplication(this.fb),
      crimeInformation: this.crimeInfoHelper.setupFormGroup(this.fb, this.FORM_TYPE),
      medicalInformation: this.medicalInfoHelper.setupFormGroup(this.fb, this.FORM_TYPE),
      expenseInformation: this.expenseInfoHelper.setupFormGroup(this.fb, this.FORM_TYPE),
      representativeInformation: this.representativeInfoHelper.setupFormGroup(this.fb, this.FORM_TYPE),
      declarationInformation: this.declarationInfoHelper.setupFormGroup(this.fb, this.FORM_TYPE),
      authorizationInformation: this.authInfoHelper.setupFormGroup(this.fb, this.FORM_TYPE),
      totalAttachmentSize: [0]
    });
  }

  @HostListener('window:afterprint')
  onafterprint() {
    document.querySelectorAll('.slide-close')[0].classList.remove('hide-for-print');
    window.scroll(0, 0);
    this.showPrintView = false;
  }

  downloadPDF() {
    this.getAEMPDF()
      .then((pdf: string) => {
        let downloadLink = document.createElement('a');
        downloadLink.href = 'data:application/pdf;base64,' + pdf;
        downloadLink.download = 'Witness-Application.pdf';
        downloadLink.target = '_blank';

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      })
      .catch((err) => {
        console.log('error getting pdf');
        console.log(err);
      });
  }

  getAEMPDF(): Promise<string> {
    return new Promise((resolve, reject) => {
      let application: Application = _.cloneDeep(this.harvestForm());
      //sending large document info to aem causes it to crap out - it's also unnecessary info, so let's not send it!
      application.CrimeInformation.documents.forEach((doc) => (doc.body = ''));
      application.RepresentativeInformation.documents.forEach((doc) => (doc.body = ''));
      //full name display option for single fields
      application.PersonalInformation.fullName =
        application.PersonalInformation.firstName + ' ' + application.PersonalInformation.lastName;
      //display all locations as a single comma separated string
      application.CrimeInformation.crimeLocations[0].location = application.CrimeInformation.crimeLocations
        .map((a) => a.location)
        .join(', ');
      //for on behalf of, if you chose parent, pdf format doesn't match webform, so relationship workaround
      if (application.RepresentativeInformation.completingOnBehalfOf == OnBehalfOf.Parent) {
        application.RepresentativeInformation.relationshipToPersonParent =
          application.RepresentativeInformation.relationshipToPerson;
        application.RepresentativeInformation.relationshipToPerson = '';
      }
      this.aemService.getWitnessApplicationPDF(application).subscribe(
        (res: any) => {
          console.log(res);
          if (res.responseMessage) {
            resolve(res.responseMessage);
          } else {
            reject(res);
          }
        },
        (err) => {
          reject(err);
          console.log(err);
        }
      );
    });
  }

  getAuthPDF(): Promise<string> {
    return new Promise((resolve, reject) => {
      let application: Application = _.cloneDeep(this.harvestForm());
      //sending large document info to aem causes it to crap out - it's also unnecessary info, so let's not send it!
      application.CrimeInformation.documents.forEach((doc) => (doc.body = ''));
      application.RepresentativeInformation.documents.forEach((doc) => (doc.body = ''));
      //full name display option for single fields
      application.PersonalInformation.fullName =
        application.PersonalInformation.firstName + ' ' + application.PersonalInformation.lastName;
      this.aemService.getAuthorizationPDF(application).subscribe(
        (res: any) => {
          console.log(res);
          if (res.responseMessage) {
            resolve(res.responseMessage);
          } else {
            reject(res);
          }
        },
        (err) => {
          reject(err);
          console.log(err);
        }
      );
    });
  }

  getApplicationPDFs() {
    return new Promise(async (resolve, reject) => {
      let ret: DocumentCollectioninformation[] = [];
      let promise_array = [];

      promise_array.push(
        new Promise<void>((resolve, reject) => {
          this.getAEMPDF()
            .then((pdf: string) => {
              ret.push({
                body: pdf,
                filename: 'Witness-Application.pdf',
                subject: ''
              });
              resolve();
            })
            .catch((err) => {
              console.log(err);
              reject();
            });
        })
      );

      promise_array.push(
        new Promise<void>((resolve, reject) => {
          this.getAuthPDF()
            .then((auth_pdf: string) => {
              ret.push({
                body: auth_pdf,
                filename: 'Authorization Form.pdf',
                subject: ''
              });
              resolve();
            })
            .catch((err) => {
              console.log(err);
              reject();
            });
        })
      );

      Promise.all(promise_array)
        .then((res) => {
          resolve(ret);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  }

  printApplication() {
    window.scroll(0, 0);
    this.showPrintView = true;
    document.querySelectorAll('.slide-close')[0].classList.add('hide-for-print');
    setTimeout(() => {
      window.print();
    }, 100);
  }
}
