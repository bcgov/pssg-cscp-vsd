import { Component, OnInit } from '@angular/core';
import { User } from '../models/user.model';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { CanDeactivateGuard } from '../services/can-deactivate-guard.service';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SignPadDialog } from '../sign-dialog/sign-dialog.component';
import { SummaryOfBenefitsDialog } from '../summary-of-benefits/summary-of-benefits.component';
import { DeactivateGuardDialog } from '../shared/guard-dialog/guard-dialog.component';
import { CancelApplicationDialog } from '../shared/cancel-dialog/cancel-dialog.component';
import { JusticeApplicationDataService } from '../services/justice-application-data.service';
import { FormBase } from '../shared/form-base';
import { HOSPITALS } from '../shared/hospital-list';
import { EnumHelper, ApplicationType } from '../shared/enums-list';
import { MY_FORMATS } from '../shared/enums-list';
import { Application, Introduction, PersonalInformation, CrimeInformation, MedicalInformation, ExpenseInformation, EmploymentIncomeInformation, RepresentativeInformation, DeclarationInformation, AuthorizationInformation } from '../interfaces/application.interface';
import { window } from 'ngx-bootstrap';
import { COUNTRIES_ADDRESS } from '../shared/address/country-list';
import { REPRESENTATIVE_LIST } from '../constants/representative-list';
import { CrimeInfoHelper } from '../shared/crime-information/crime-information.helper';
import { MedicalInfoHelper } from '../shared/medical-information/medical-information.helper';
import { AuthInfoHelper } from '../shared/authorization-information/authorization-information.helper';
import { POSTAL_CODE } from '../shared/regex.constants';
import { PersonalInfoHelper } from '../shared/personal-information/personal-information.helper';
import { RepresentativeInfoHelper } from '../shared/representative-information/representative-information.helper';
import { DeclarationInfoHelper } from '../shared/declaration-information/declaration-information.helper';
import { ExpenseInfoHelper } from '../shared/expense-information/expense-information.helper';

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
  FORM_TYPE = ApplicationType.Victim_Application;
  postalRegex = POSTAL_CODE;
  currentUser: User;

  busy: Promise<any>;
  busy2: Promise<any>;
  busy3: Promise<any>;
  showValidationMessage: boolean;
  familyDoctorNameItem: FormControl;
  otherTreatmentItems: FormArray;
  employerItems: FormArray;
  courtFileItems: FormArray;
  crimeLocationItems: FormArray;
  policeReportItems: FormArray;
  authorizedPersons: FormArray;
  submitting: boolean = false; // this controls the button state for

  hospitalList = HOSPITALS;
  provinceList: string[];
  relationshipList: string[];
  enumHelper = new EnumHelper();

  showAddEmployer: boolean = true;
  showRemoveEmployer: boolean = false;

  public currentFormStep: number = 0; // form flow. Which step are we on?

  expenseMinimumMet: boolean = null;
  saveFormData: any;

  ApplicationType = ApplicationType;

  // a field that represents the current employment income information state
  employmentIncomeInformation: EmploymentIncomeInformation;
  employmentInfoFormIsValid: boolean = false;

  get preferredMethodOfContact() { return this.form.get('personalInformation.preferredMethodOfContact'); }

  personalInfoHelper = new PersonalInfoHelper();
  crimeInfoHelper = new CrimeInfoHelper();
  medicalInfoHelper = new MedicalInfoHelper();
  expenseInfoHelper = new ExpenseInfoHelper();
  representativeInfoHelper = new RepresentativeInfoHelper();
  declarationInfoHelper = new DeclarationInfoHelper();
  authInfoHelper = new AuthInfoHelper();

  constructor(
    private justiceDataService: JusticeApplicationDataService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public snackBar: MatSnackBar,
    private matDialog: MatDialog, // popup to show static content,
  ) {
    super();
    var canada = COUNTRIES_ADDRESS.filter(c => c.name.toLowerCase() == 'canada')[0];
    this.provinceList = canada.areas;
    this.relationshipList = REPRESENTATIVE_LIST.name;
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

    this.form.get('employmentIncomeInformation').valueChanges.subscribe(() => this.validateEmploymentInfoForm());
  }

  buildApplicationForm(): void {
    this.form = this.fb.group({
      introduction: this.fb.group({
        understoodInformation: [null, Validators.requiredTrue]
      }),
      personalInformation: this.personalInfoHelper.setupFormGroup(this.fb, this.FORM_TYPE),
      crimeInformation: this.crimeInfoHelper.setupFormGroup(this.fb, this.FORM_TYPE),
      medicalInformation: this.medicalInfoHelper.setupFormGroup(this.fb, this.FORM_TYPE),
      expenseInformation: this.expenseInfoHelper.setupFormGroup(this.fb, this.FORM_TYPE),
      employmentIncomeInformation: this.fb.group({
        wereYouEmployedAtTimeOfCrime: ['', Validators.required],
        wereYouAtWorkAtTimeOfIncident: [''],
        haveYouAppliedToWorkSafe: [''],
        wsbcClaimNumber: [''],
        didYouMissWorkDueToCrime: ['', Validators.required],
        didYouLoseWages: [''],
        areYouSelfEmployed: [''],
        mayContactEmployer: [''],
        haveYouAppliedForWorkersCompensation: [''],
        areYouStillOffWork: [''],
        daysWorkMissedStart: [''],
        daysWorkMissedEnd: [''],
        workersCompensationClaimNumber: [''],
        employers: this.fb.array([this.createEmployerInfo()]),
      }),
      // employmentIncomeInformation: [null],//, Validators.required],

      representativeInformation: this.representativeInfoHelper.setupFormGroup(this.fb, this.FORM_TYPE),
      declarationInformation: this.declarationInfoHelper.setupFormGroup(this.fb, this.FORM_TYPE),
      authorizationInformation: this.authInfoHelper.setupFormGroup(this.fb, this.FORM_TYPE),
    });
  }

  showSummaryOfBenefits(): void {
    const summaryDialogRef = this.matDialog.open(SummaryOfBenefitsDialog, { maxWidth: '800px !important', data: 'victim' });
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


  addEmployer(): void {
    // add an employer to the list
    console.log("add employer");
    this.employerItems = this.form.get('employmentIncomeInformation.employers') as FormArray;
    this.employerItems.push(this.createEmployerInfo());
    this.showAddEmployer = this.employerItems.length < 5;
    this.showRemoveEmployer = this.employerItems.length > 1;
    //let the form render and update status before validating it
    setTimeout(() => {
      this.validateEmploymentInfoForm();
    }, 200)

  }

  removeEmployer(index: number): void {
    // remove the employer from the list of employers
    this.employerItems = this.form.get('employmentIncomeInformation.employers') as FormArray;
    this.employerItems.removeAt(index);
    this.showAddEmployer = this.employerItems.length < 5;
    this.showRemoveEmployer = this.employerItems.length > 1;
  }

  getEmployerItem(index: number): FormControl {
    // TODO: this appears to be unused.
    // collect item from the employer array.
    return (<FormArray>this.form.get('employmentIncomeInformation.employers')).controls[index] as FormControl;
  }

  setEmploymentInformation(ei: EmploymentIncomeInformation) {
    this.form.get('employmentIncomeInformation').patchValue(ei);
  }

  createEmployerInfo(): FormGroup {
    return this.fb.group({
      employerName: '',
      employerPhoneNumber: '',
      employerFax: '',
      employerEmail: '',
      employerFirstName: '',
      employerLastName: '',
      employerAddress: this.fb.group({
        line1: [''],
        line2: [''],
        city: [''],
        postalCode: [''], //// postalCode: ['', [Validators.pattern(postalRegex), Validators.required]],
        province: [{ value: 'British Columbia', disabled: false }],
        country: [{ value: 'Canada', disabled: false }],
      }),
      contactable: '',
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

    //var doc = new jsPDF;


    //var printContents = document.getElementById('pdfPrintGroup').innerHTML;
    var printContents = "<html>Hello World</html>";

    //var w = window.open();
    //var fileOutput =
    this.justiceDataService.createPDF(printContents).subscribe(response => { // download file
      var mediaType = 'application/pdf';
      console.log(response);
      ////var blob = new Blob([response._body], { type: mediaType });


      ////=============
      ////const byteCharacters = btoa(response);
      ////const byteNumbers = new Array(byteCharacters.length);
      //const byteNumbers = new Array(response.length);
      //for (let i = 0; i < response.length; i++) {
      //  byteNumbers[i] = response.charCodeAt(i);
      //}
      //const byteArray = new Uint8Array(byteNumbers);
      //const blob = new Blob([byteArray], { type: mediaType });
      //window.open(URL.createObjectURL(blob));
      ////=============



      ////=============
      //const a = document.createElement("a");
      ////let pdfWindow = window.open("")
      ////pdfWindow.document.write("<iframe width='100%' height='100%' src='data:application/pdf;base64, " + encodeURI(btoa(response)) + "'></iframe>")
      //a.href = "data:application/pdf," + response;
      ////a.href = "data:application/pdf;base64," + response.message;
      //a.download = "file.pdf";
      //document.body.appendChild(a);
      //a.click();
      ////=============



      //=============
      //let newResponse: string = response;
      var blob = new Blob([response], { type: mediaType });
      console.log(blob);
      ////saveAs(blob, "myPDF.pdf");
      ////var blob = new Blob([JSON.stringify(response)], { type: mediaType });
      var blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl);
      //window.open(URL.createObjectURL(blob));
      //=============


      ////=============
      //var blob = new Blob([response], { type: mediaType }),
      //  url = URL.createObjectURL(blob),
      //  _iFrame = document.createElement('iframe');

      //_iFrame.setAttribute('src', url);
      ////_iFrame.setAttribute('style', 'visibility:hidden;');
      //window.open(url);
      ////$('#someDiv').append(_iFrame);
      ////=============


      //=======
      //var newFile = new File(response, 'tempOut.pdf');
      //const blobUrl = URL.createObjectURL(newFile);
      //window.open(blobUrl);
      //=======

      //const iframe = document.createElement('iframe');
      //iframe.style.display = 'none';
      //iframe.src = blobUrl;
      //document.body.appendChild(iframe);
      //iframe.contentWindow.print();
    });
    ////var fileOutput = this.justiceDataService.createPDF(printContents);
    //w.document.write(String(fileOutput));
    //w.print();
    //w.close();


    //window.print();

    //var w = window.open();
    //w.document.write(printContents);
    //w.print();

    //w.close();
  }

  submitApplication() {
    //let formIsValid = true;showValidationMessage
    // show the button as submitting and disable it
    this.submitting = true;
    if ((this.form.valid) || (this.form.controls.personalInformation.valid // It's OK if this.form.controls.employmentIncomeInformation.valid is not valid
      && this.form.controls.crimeInformation.valid
      && this.form.controls.declarationInformation.valid
      && this.form.controls.expenseInformation.valid
      && this.form.controls.introduction.valid
      && this.form.controls.medicalInformation.valid
      && this.form.controls.personalInformation.valid
      && this.form.controls.representativeInformation.valid)) {
      this.justiceDataService.submitApplication(this.harvestForm())
        .subscribe(
          data => {
            if (data['isSuccess'] == true) {
              this.router.navigate(['/application-success']);
            }
            else {
              // re-enable the button
              this.submitting = false;
              this.snackBar.open('Error submitting application. ' + data['message'], 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
              console.log('Error submitting application. ' + data['message']);
            }
          },
          error => {
            // re-enable the button
            this.submitting = false;
            this.snackBar.open('Error submitting application', 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
            console.log('Error submitting application');
          }
        );
    } else {
      // re-enable the button
      this.submitting = false;
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
    let appliedForWorkSafeBC = this.form.get('employmentIncomeInformation.haveYouAppliedToWorkSafe');

    appliedForWorkersComp.clearValidators();
    appliedForWorkersComp.setErrors(null);
    appliedForWorkSafeBC.clearValidators();
    appliedForWorkSafeBC.setErrors(null);

    let useValidation = isChecked === true;
    if (useValidation) {
      appliedForWorkersComp.setValidators([Validators.required]);
      appliedForWorkSafeBC.setValidators([Validators.required]);
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
    console.log("doing stuff we don't want...")
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

  validateEmploymentInfoForm() {
    console.log("validateEmploymentInfoForm");
    let eiForm = document.querySelector(".employment-info-form");
    this.employmentInfoFormIsValid = eiForm.classList.contains("ng-valid");
    console.log(this.employmentInfoFormIsValid);
  }

}
