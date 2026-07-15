import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, HostListener, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';

import { ApplicationDraftsService } from '../../api/application-drafts/application-drafts.service';
import { JusticeService } from '../../api/justice/justice.service';
import { ApplicationDraft, CreateApplicationDraftRequest, DraftType, UpdateApplicationDraftRequest } from '../../model';
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
  RepresentativeInformation
} from '../interfaces/application.interface';
import { AEMService } from '../services/aem.service';
import { LoginService } from '../services/login.service';
import { StateService } from '../services/state.service';
import { AddressHelper } from '../shared/address/address.helper';
import { AuthInfoHelper } from '../shared/authorization-information/authorization-information.helper';
import { CrimeInfoHelper } from '../shared/crime-information/crime-information.helper';
import { DeclarationInfoHelper } from '../shared/declaration-information/declaration-information.helper';
import { CancelDialog } from '../shared/dialogs/cancel/cancel.dialog';
import { EmploymentInfoHelper } from '../shared/employment-information/employment-information.helper';
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

@Component({
  selector: 'app-victim-application',
  templateUrl: './victim-application.component.html',
  styleUrls: ['./victim-application.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true } }
  ],
  standalone: false
})
export class VictimApplicationComponent extends FormBase implements OnInit, OnDestroy {
  @ViewChild('stepper') victimStepper: MatStepper;
  FORM_TYPE = ApplicationType.Victim_Application;

  submitting: boolean = false;
  public showPrintView: boolean = false;

  public currentFormStep: number = 0;

  saveFormData: any;
  draftId: string | null = null;
  saving = false;
  draftSavedMessage = '';
  formChanged = false;
  lastSavedAt: Date | null = null;

  autoSaveTimer: any;
  autoSaveCountdown = 0;
  autoSaveInterval = 60;

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
  protected readonly lookupStore = inject(LookupStore);
  private readonly justiceService = inject(JusticeService);
  private readonly draftsService = inject(ApplicationDraftsService);
  private readonly fb = inject(UntypedFormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly snackBar = inject(MatSnackBar);
  private readonly matDialog = inject(MatDialog);
  readonly state = inject(StateService);
  private readonly aemService = inject(AEMService);
  private readonly authService = inject(LoginService);

  get canSaveDraft(): boolean {
    return this.authService.isAuthenticated.value;
  }

  private steps: Array<string> = [
    'introduction',
    'personalInformation',
    'crimeInformation',
    'medicalInformation',
    'expenseInformation',
    'employmentIncomeInformation',
    'representativeInformation',
    'declarationInformation',
    'authorizationInformation'
  ];

  constructor() {
    super();
  }

  ngOnInit() {
    var ua = window.navigator.userAgent;
    this.isIE = /MSIE|Trident/.test(ua);
    let completeOnBehalfOf = this.route.snapshot.queryParamMap.get('ob');
    if (this.state.cloning) {
      this.form = this.state.data;
      this.state.cloning = false;
    } else {
      this.form = this.buildApplicationForm();
    }

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
      if (!this.form.dirty) return;
      this.formChanged = true;
      if (this.canSaveDraft) {
        this.resetAutoSaveTimer();
      }

      const currentFormGroupName = this.steps[this.victimStepper.selectedIndex];
      const currentFormGroup = this.form.get(currentFormGroupName);
      this.showValidationMessage = this.hasInvalidTouchedControls(currentFormGroup);
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.autoSaveTimer);
  }

  @HostListener('window:mousemove')
  @HostListener('window:mousedown')
  @HostListener('window:keypress')
  @HostListener('window:scroll')
  @HostListener('window:touchmove')
  resetAutoSaveTimer(): void {
    if (!this.formChanged || !this.canSaveDraft) {
      this.autoSaveCountdown = 0;
      clearInterval(this.autoSaveTimer);
      return;
    }

    this.autoSaveCountdown = this.autoSaveInterval;
    clearInterval(this.autoSaveTimer);
    this.autoSaveTimer = setInterval(() => {
      this.autoSaveCountdown -= 1;
      if (this.autoSaveCountdown === 0) {
        this.saveDraft();
        clearInterval(this.autoSaveTimer);
      }
    }, 1000);
  }

  buildApplicationForm(FORM: ApplicationType = this.FORM_TYPE): UntypedFormGroup {
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
      totalAttachmentSize: [0]
    };

    if (FORM === ApplicationType.IFM_Application) {
      group['victimInformation'] = this.victimInfoHelper.setupFormGroupForIfmApplication(this.fb);
    }

    if (FORM === ApplicationType.Victim_Application) {
      group['employmentIncomeInformation'] = this.employmentInfoHelper.setupFormGroup(this.fb, FORM);
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
      data: { type: 'Application' }
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
    this.saveDraft();
  }

  gotoNextStep(stepper: MatStepper, emptyPage?: boolean): void {
    // when a user clicks the continue button we move them to the next part of the form
    if (stepper != null) {
      // get the text value of the form index
      const formGroupName = this.steps[stepper.selectedIndex];
      // console.log(`Form for validation is ${formGroupName}.`);
      // be sure that the stepper is in range
      if (stepper.selectedIndex >= 0 && stepper.selectedIndex < this.steps.length) {
        // collect the matching form group from the form
        const formParts = this.form.get(formGroupName);
        // TODO: how do we know this is true?
        let formValid = true;

        // if there is a form returned with the name
        if (formParts != null) {
          // collect the validity of it
          formValid = formParts.valid;

          // if form has sin field, validate it specifically
          const sinControl = formParts.get('sin');
          if (sinControl != null) {
            const isRequired = sinControl.hasValidator(Validators.required);
            formValid = formValid && this.validateSIN(sinControl.value, isRequired);
          }
        } else {
          alert('That was a null form. Nothing to validate');
        }

        // Ensure if the page is empty that the form is valid
        if (emptyPage != null) {
          if (emptyPage == true) {
            formValid = true;
            //formParts.valid = true;
          }
        }
        if (formValid) {
          // console.log('Form is valid so proceeding to next step.')
          this.showValidationMessage = false;
          window.scroll(0, 0);
          stepper.next();
        } else {
          console.log('Form is not valid rerun the validation and show the validation message.');
          this.validateAllFormFields(formParts);
          this.showValidationMessage = true;
        }
      }
    }
  }

  downloadPDF() {
    this.getAEMPDF()
      .then((pdf: string) => {
        let downloadLink = document.createElement('a');
        downloadLink.href = 'data:application/pdf;base64,' + pdf;
        downloadLink.download = 'Victim-Application.pdf';
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
      let application: Application = this.harvestForm();
      //sending large document info to aem causes it to crap out - it's also unnecessary info, so let's not send it!
      application.CrimeInformation.documents.forEach((doc) => (doc.body = ''));
      application.EmploymentIncomeInformation.documents.forEach((doc) => (doc.body = ''));
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
      this.aemService.getVictimApplicationPDF(application).subscribe(
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
          var errorStatus = this.aemService.getErrorStatus(err);
          if (errorStatus === 404) {
            console.log('PDF generation services are unavailable');
            this.snackBar.open('PDF generation services are unavailable.', 'Close', { duration: 5000 });
          }

          if (errorStatus === 400) {
            console.log('Form is invalid, cannot generate PDF');
            this.snackBar.open('The form is invalid. Please review your entries and try again.', 'Close', { duration: 5000 });
          }
          console.log(err);
        }
      );
    });
  }

  getAuthPDF(): Promise<string> {
    return new Promise((resolve, reject) => {
      let application: Application = JSON.parse(JSON.stringify(this.harvestForm()));
      //sending large document info to aem causes it to crap out - it's also unnecessary info, so let's not send it!
      application.CrimeInformation.documents.forEach((doc) => (doc.body = ''));
      application.EmploymentIncomeInformation.documents.forEach((doc) => (doc.body = ''));
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
                filename: 'Victim-Application.pdf',
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

  @HostListener('window:afterprint')
  onafterprint() {
    document.querySelectorAll('.slide-close')[0].classList.remove('hide-for-print');
    window.scroll(0, 0);
    this.showPrintView = false;
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

    if (
      this.form.valid ||
      (this.form.controls.personalInformation.valid && // It's OK if this.form.controls.employmentIncomeInformation.valid is not valid
        this.form.controls.crimeInformation.valid &&
        this.form.controls.declarationInformation.valid &&
        this.form.controls.expenseInformation.valid &&
        this.form.controls.introduction.valid &&
        this.form.controls.medicalInformation.valid &&
        this.form.controls.personalInformation.valid &&
        this.form.controls.representativeInformation.valid)
    ) {
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
      const findInvalidControls = (group: UntypedFormGroup | UntypedFormArray, path = ''): void => {
        Object.keys(group.controls).forEach((key) => {
          const control = (group as any).controls[key];
          const controlPath = path ? `${path}.${key}` : key;
          if (control.invalid) {
            if (control instanceof UntypedFormGroup || control instanceof UntypedFormArray) {
              findInvalidControls(control, controlPath);
            } else {
              console.warn('Invalid control:', controlPath, control.errors);
            }
          }
        });
      };
      findInvalidControls(this.form);
    }
  }

  submitApplicationAndClone(type: string) {
    this.markAsTouched();

    if (this.form.valid) {
      this.submitting = true;
      const formClone = this.form;
      let form = this.harvestForm();
      this.submit(form)
        .then(() => {
          if (type === 'VICTIM') {
            let victimForm = this.cloneFormToVictim(formClone);
            this.victimStepper.reset();
            this.form = victimForm;
          } else if (type === 'IFM') {
            let ifmForm = this.cloneFormToIFM(formClone);
            this.state.cloning = true;
            this.state.data = ifmForm;
            this.router.navigate(['/application/ifm']);
          } else {
            this.router.navigate(['/application-success']);
          }
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
    const rawForm = this.form.getRawValue();
    let data = {
      ApplicationType: this.FORM_TYPE,
      ApplicationDate: new Date(),
      ApplicationPDFs: [],
      DraftId: this.draftId,
      Introduction: rawForm.introduction as Introduction,
      PersonalInformation: rawForm.personalInformation as PersonalInformation,
      CrimeInformation: rawForm.crimeInformation as CrimeInformation,
      MedicalInformation: rawForm.medicalInformation as MedicalInformation,
      ExpenseInformation: rawForm.expenseInformation as ExpenseInformation,
      EmploymentIncomeInformation: rawForm.employmentIncomeInformation as EmploymentIncomeInformation,
      RepresentativeInformation: rawForm.representativeInformation as RepresentativeInformation,
      DeclarationInformation: rawForm.declarationInformation as DeclarationInformation,
      AuthorizationInformation: rawForm.authorizationInformation as AuthorizationInformation
    } as Application;

    return data;
  }

  save(): void {
    this.justiceService.postApiJusticeSaveapplication(this.harvestForm() as any).subscribe(
      (data) => {},
      (err) => {}
    );
  }

  /** Save current form state as a draft via the ApplicationDrafts API. */
  saveDraft(): void {
    if (!this.formChanged || !this.canSaveDraft) return;

    this.saving = true;
    this.draftSavedMessage = '';
    const formData = JSON.stringify(this.form.getRawValue());

    if (this.draftId) {
      // Update existing draft
      const request: UpdateApplicationDraftRequest = { formData };
      this.draftsService.putApiApplicationDraftsDraftId(this.draftId, request).subscribe({
        next: () => {
          this.saving = false;
          this.lastSavedAt = new Date();
          this.formChanged = false;
          this.form.markAsPristine();
          this.draftSavedMessage = 'Draft saved.';
          clearInterval(this.autoSaveTimer);
          this.autoSaveCountdown = 0;
          this.snackBar.open('Draft saved successfully.', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.saving = false;
          this.snackBar.open('Failed to save draft.', 'Close', { duration: 5000 });
          console.error('Failed to update draft', err);
        }
      });
    } else {
      // Create new draft
      const request: CreateApplicationDraftRequest = {
        draftType: DraftType.VictimApplication,
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
            this.lastSavedAt = new Date();
            this.formChanged = false;
            this.form.markAsPristine();
            this.draftSavedMessage = 'Draft saved.';
            clearInterval(this.autoSaveTimer);
            this.autoSaveCountdown = 0;
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
    this.draftsService.getApiApplicationDraftsDraftId<ApplicationDraft>(draftId).subscribe({
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
    // Resize FormArrays to match saved data before patching
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
    this.resizeFormArray('employmentIncomeInformation', 'employers', savedData, () =>
      this.employmentInfoHelper.createEmployerInfo(this.fb)
    );
    this.resizeFormArray('employmentIncomeInformation', 'documents', savedData, () =>
      this.fb.group({ filename: [''], body: [''], subject: [''], size: [0] })
    );
    this.resizeFormArray('medicalInformation', 'otherTreatments', savedData, () =>
      this.medicalInfoHelper.createTreatmentItem(this.fb, this.FORM_TYPE)
    );
    this.resizeFormArray('crimeInformation', 'documents', savedData, () =>
      this.fb.group({ filename: [''], body: [''], subject: [''], size: [0] })
    );
    this.resizeFormArray('representativeInformation', 'documents', savedData, () =>
      this.fb.group({ filename: [''], body: [''], subject: [''], size: [0] })
    );

    const empInfo = savedData?.employmentIncomeInformation;
    if (empInfo != null && empInfo.haveYouAppliedToWorkSafe != null && empInfo.haveYouAppliedToWorkSafe !== '') {
      empInfo.haveYouAppliedForWorkersCompensation = empInfo.haveYouAppliedToWorkSafe;
    }

    this.form.patchValue(savedData, { emitEvent: false });

    // Re-apply postal/zip code validators based on the restored country values, since
    // patchValue with emitEvent:false does not trigger the country-change handlers.
    this.reapplyPostalCodeValidators();
  }

  /** Ensure a FormArray has the correct number of items to accept patchValue data. */
  private resizeFormArray(groupName: string, arrayName: string, savedData: any, createFn: () => any): void {
    const savedArray = savedData?.[groupName]?.[arrayName];
    if (!Array.isArray(savedArray)) return;

    const formGroup = this.form.get(groupName);
    if (!formGroup) return;

    const formArray = formGroup.get(arrayName) as UntypedFormArray;
    if (!formArray) return;

    // Add or remove items to match the saved length
    while (formArray.length < savedArray.length) {
      formArray.push(createFn());
    }
    while (formArray.length > savedArray.length) {
      formArray.removeAt(formArray.length - 1);
    }
  }

  /** Re-apply the correct postal/zip code validator for every address in the form based on the
   *  restored country value. This is needed after loading a draft because patchValue with
   *  emitEvent:false does not trigger the country-change handlers that normally update validators. */
  private reapplyPostalCodeValidators(): void {
    const addressHelper = new AddressHelper();

    const simpleAddressPaths = [
      'personalInformation.primaryAddress',
      'personalInformation.alternateAddress',
      'representativeInformation.representativeAddress',
      'crimeInformation.racafInformation.lawyerAddress',
      'medicalInformation.familyDoctorAddress'
    ];

    for (const path of simpleAddressPaths) {
      addressHelper.updatePostalCodeValidatorByCountry(this.form.get(path) as UntypedFormGroup);
    }

    const treatmentsArray = this.form.get('medicalInformation.otherTreatments') as UntypedFormArray;
    treatmentsArray?.controls.forEach((ctrl) =>
      addressHelper.updatePostalCodeValidatorByCountry(ctrl.get('providerAddress') as UntypedFormGroup)
    );

    const employersArray = this.form.get('employmentIncomeInformation.employers') as UntypedFormArray;
    employersArray?.controls.forEach((ctrl) =>
      addressHelper.updatePostalCodeValidatorByCountry(ctrl.get('employerAddress') as UntypedFormGroup)
    );

    const authorizedPersonsArray = this.form.get('authorizationInformation.authorizedPerson') as UntypedFormArray;
    authorizedPersonsArray?.controls.forEach((ctrl) =>
      addressHelper.updatePostalCodeValidatorByCountry(ctrl.get('authorizedPersonAgencyAddress') as UntypedFormGroup)
    );
  }

  markAsTouched() {
    this.form.markAsTouched();
  }

  cloneFormToVictim(currentForm) {
    // console.log("cloning Victim to Victim");
    // console.log(currentForm);
    let ret = this.buildApplicationForm(ApplicationType.Victim_Application);

    ret.get('personalInformation').patchValue(currentForm.get('personalInformation').value);
    ret.get('personalInformation').get('firstName').patchValue('');
    ret.get('personalInformation').get('middleName').patchValue('');
    ret.get('personalInformation').get('lastName').patchValue('');
    ret.get('personalInformation').get('iHaveOtherNames').patchValue('');
    ret.get('personalInformation').get('otherFirstName').patchValue('');
    ret.get('personalInformation').get('otherLastName').patchValue('');
    ret.get('personalInformation').get('dateOfNameChange').patchValue('');
    ret.get('personalInformation').get('gender').patchValue(null);
    ret.get('personalInformation').get('otherGender').patchValue('');
    ret.get('personalInformation').get('pronouns').patchValue(null);
    ret.get('personalInformation').get('otherPronouns').patchValue('');
    ret.get('personalInformation').get('raceEthnicity').patchValue(null);
    ret.get('personalInformation').get('otherRaceEthnicity').patchValue('');
    ret.get('personalInformation').get('indigenousStatus').patchValue(0);
    ret.get('personalInformation').get('birthDate').patchValue('');
    ret.get('personalInformation').get('maritalStatus').patchValue(0);
    ret.get('personalInformation').get('sin').patchValue('');
    ret.get('personalInformation').get('occupation').patchValue('');
    ret.get('personalInformation').get('permissionToContactViaMethod').patchValue(false);
    ret.get('personalInformation').get('agreeToCvapCommunicationExchange').patchValue('');
    ret.get('personalInformation').get('leaveVoicemail').patchValue(0);
    let crimeLocationsLength = currentForm.get('crimeInformation').get('crimeLocations').value.length;
    let crimeLocations = ret.get('crimeInformation').get('crimeLocations') as UntypedFormArray;
    let policeReportsLength = currentForm.get('crimeInformation').get('policeReports').value.length;
    let policeReports = ret.get('crimeInformation').get('policeReports') as UntypedFormArray;

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
    ret
      .get('crimeInformation')
      .get('racafInformation')
      .patchValue(this.crimeInfoHelper.createRACAFInformation(this.fb).value);

    let authorizedPersonsLength = currentForm.get('authorizationInformation').get('authorizedPerson').value.length;
    let authorizedPersons = ret.get('authorizationInformation').get('authorizedPerson') as UntypedFormArray;

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
    // console.log("cloning Victim to IFM");
    // console.log(currentForm);
    let ret = this.buildApplicationForm(ApplicationType.IFM_Application);

    ret
      .get('personalInformation')
      .get('preferredMethodOfContact')
      .patchValue(currentForm.get('personalInformation').get('preferredMethodOfContact').value);
    ret
      .get('personalInformation')
      .get('permissionToContactViaMethod')
      .patchValue(currentForm.get('personalInformation').get('permissionToContactViaMethod').value);
    ret
      .get('personalInformation')
      .get('agreeToCvapCommunicationExchange')
      .patchValue(currentForm.get('personalInformation').get('agreeToCvapCommunicationExchange').value);
    ret
      .get('personalInformation')
      .get('phoneNumber')
      .patchValue(currentForm.get('personalInformation').get('phoneNumber').value);
    ret
      .get('personalInformation')
      .get('leaveVoicemail')
      .patchValue(currentForm.get('personalInformation').get('leaveVoicemail').value);
    ret
      .get('personalInformation')
      .get('alternatePhoneNumber')
      .patchValue(currentForm.get('personalInformation').get('alternatePhoneNumber').value);
    ret.get('personalInformation').get('email').patchValue(currentForm.get('personalInformation').get('email').value);
    ret
      .get('personalInformation')
      .get('confirmEmail')
      .patchValue(currentForm.get('personalInformation').get('confirmEmail').value);
    ret
      .get('personalInformation')
      .get('doNotLiveAtAddress')
      .patchValue(currentForm.get('personalInformation').get('doNotLiveAtAddress').value);
    ret
      .get('personalInformation')
      .get('mailRecipient')
      .patchValue(currentForm.get('personalInformation').get('mailRecipient').value);
    ret
      .get('personalInformation')
      .get('primaryAddress')
      .patchValue(currentForm.get('personalInformation').get('primaryAddress').value);
    ret
      .get('personalInformation')
      .get('alternateAddress')
      .patchValue(currentForm.get('personalInformation').get('alternateAddress').value);

    ret.get('victimInformation').patchValue(currentForm.get('personalInformation').value);

    let crimeLocationsLength = currentForm.get('crimeInformation').get('crimeLocations').value.length;
    let crimeLocations = ret.get('crimeInformation').get('crimeLocations') as UntypedFormArray;
    let policeReportsLength = currentForm.get('crimeInformation').get('policeReports').value.length;
    let policeReports = ret.get('crimeInformation').get('policeReports') as UntypedFormArray;
    let courtFilesLength = currentForm.get('crimeInformation').get('courtFiles').value.length;
    let courtFiles = ret.get('crimeInformation').get('courtFiles') as UntypedFormArray;

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
    ret
      .get('crimeInformation')
      .get('racafInformation')
      .patchValue(this.crimeInfoHelper.createRACAFInformation(this.fb).value);

    let authorizedPersonsLength = currentForm.get('authorizationInformation').get('authorizedPerson').value.length;
    let authorizedPersons = ret.get('authorizationInformation').get('authorizedPerson') as UntypedFormArray;

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
