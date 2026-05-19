import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, HostListener, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { LoginService } from '../services/login.service';
import { StateService } from '../services/state.service';
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
  selector: 'app-ifm-application',
  templateUrl: './ifm-application.component.html',
  styleUrls: ['./ifm-application.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true } }
  ],
  standalone: false
})
export class IfmApplicationComponent extends FormBase implements OnInit, OnDestroy {
  @ViewChild('stepper') ifmStepper: MatStepper;
  FORM_TYPE = ApplicationType.IFM_Application;
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
  formChanged = false;
  lastSavedAt: Date | null = null;

  autoSaveTimer: any;
  autoSaveCountdown = 0;
  autoSaveInterval = 60;

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
    public state: StateService,
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
      const currentFormGroupName = this.getFormGroupName(this.ifmStepper.selectedIndex);
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
    this.saveDraft();
  }

  gotoNextStep(stepper: MatStepper): void {
    if (stepper != null) {
      var formGroupName = this.getFormGroupName(stepper.selectedIndex);

      this.formFullyValidated = this.form.valid;

      if (stepper.selectedIndex >= 0 && stepper.selectedIndex < 9) {
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

  submitApplicationAndClone(type: string) {
    this.markAsTouched();

    if (this.form.valid) {
      this.submitting = true;
      let formClone = _.cloneDeep(this.form);
      let form = this.harvestForm();
      this.submit(form)
        .then(() => {
          if (type === 'IFM') {
            let ifmForm = this.cloneFormToIFM(formClone);
            this.ifmStepper.reset();
            this.form = ifmForm;
          } else if (type === 'VICTIM') {
            let victimForm = this.cloneFormToVictim(formClone);
            this.state.cloning = true;
            this.state.data = victimForm;
            this.router.navigate(['/application/victim']);
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
      EmploymentIncomeInformation: null as EmploymentIncomeInformation, // There is no EmploymentIncomeInformation in IFM
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
    if (!this.formChanged || !this.canSaveDraft) return;

    this.saving = true;
    this.draftSavedMessage = '';
    const formData = JSON.stringify(this.form.getRawValue());

    if (this.draftId) {
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
      const request: CreateApplicationDraftRequest = {
        draftType: 100000003, // FamilyMemberApplication
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

    this.form.patchValue(savedData, { emitEvent: false });
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

  private buildApplicationForm(FORM: ApplicationType = this.FORM_TYPE): UntypedFormGroup {
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

  @HostListener('window:afterprint')
  onafterprint() {
    document.querySelectorAll('.slide-close')[0].classList.remove('hide-for-print');
    window.scroll(0, 0);
    this.showPrintView = false;
  }

  printApplication() {
    window.scroll(0, 0);
    this.showPrintView = true;
    document.querySelectorAll('.slide-close')[0].classList.add('hide-for-print');
    setTimeout(() => {
      window.print();
    }, 100);
  }

  downloadPDF() {
    this.getAEMPDF()
      .then((pdf: string) => {
        let downloadLink = document.createElement('a');
        downloadLink.href = 'data:application/pdf;base64,' + pdf;
        downloadLink.download = 'IFM-Application.pdf';
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
      this.aemService.getIFMApplicationPDF(application).subscribe(
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
                filename: 'IFM-Application.pdf',
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

  cloneFormToVictim(currentForm) {
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
    ret.get('personalInformation').get('gender').patchValue(null);
    ret.get('personalInformation').get('otherGender').patchValue('');
    ret.get('personalInformation').get('pronouns').patchValue(null);
    ret.get('personalInformation').get('otherPronouns').patchValue('');
    ret.get('personalInformation').get('raceEthnicity').patchValue(null);
    ret.get('personalInformation').get('otherRaceEthnicity').patchValue('');
    ret.get('personalInformation').get('indigenousStatus').patchValue(0);
    ret.get('personalInformation').get('birthDate').patchValue('');
    ret.get('personalInformation').get('sin').patchValue('');
    ret.get('personalInformation').get('occupation').patchValue('');
    ret.get('personalInformation').get('permissionToContactViaMethod').patchValue(false);
    ret.get('personalInformation').get('agreeToCvapCommunicationExchange').patchValue('');
    ret.get('personalInformation').get('leaveVoicemail').patchValue(0);

    ret.get('victimInformation').patchValue(currentForm.get('victimInformation').value);
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
