import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatStepper, MatVerticalStepper } from '@angular/material/stepper';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { SummaryOfBenefitsDialog } from '../summary-of-benefits/summary-of-benefits.component';
import { JusticeApplicationDataService } from '../services/justice-application-data.service';
import { FormBase } from '../shared/form-base';
import { ApplicationType } from '../shared/enums-list';
import { MY_FORMATS } from '../shared/enums-list';
import { Application, Introduction, PersonalInformation, CrimeInformation, MedicalInformation, ExpenseInformation, EmploymentIncomeInformation, RepresentativeInformation, DeclarationInformation, AuthorizationInformation } from '../interfaces/application.interface';
import { window } from 'ngx-bootstrap';
import { CrimeInfoHelper } from '../shared/crime-information/crime-information.helper';
import { MedicalInfoHelper } from '../shared/medical-information/medical-information.helper';
import { AuthInfoHelper } from '../shared/authorization-information/authorization-information.helper';
import { PersonalInfoHelper } from '../shared/personal-information/personal-information.helper';
import { RepresentativeInfoHelper } from '../shared/representative-information/representative-information.helper';
import { DeclarationInfoHelper } from '../shared/declaration-information/declaration-information.helper';
import { ExpenseInfoHelper } from '../shared/expense-information/expense-information.helper';
import { EmploymentInfoHelper } from '../shared/employment-information/employment-information.helper';
import { CancelDialog } from '../shared/dialogs/cancel/cancel.dialog';
import * as _ from 'lodash';
import { StateService } from '../services/state.service';
import { VictimInfoHelper } from '../shared/victim-information/victim-information.helper';

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

export class VictimApplicationComponent extends FormBase implements OnInit {
  @ViewChild('stepper') victimStepper: MatVerticalStepper;
  FORM_TYPE = ApplicationType.Victim_Application;
  busy: Promise<any>;
  showValidationMessage: boolean;
  submitting: boolean = false;

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

  constructor(
    private justiceDataService: JusticeApplicationDataService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public snackBar: MatSnackBar,
    private matDialog: MatDialog,
    public state: StateService,
  ) {
    super();
  }

  ngOnInit() {
    let completeOnBehalfOf = this.route.snapshot.queryParamMap.get('ob');
    if (this.state.cloning) {
      this.form = this.state.data;
      this.state.cloning = false;
    }
    else {
      this.form = this.buildApplicationForm();
    }

    this.form.get('representativeInformation').patchValue({
      completingOnBehalfOf: parseInt(completeOnBehalfOf)
    });
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
      // employmentIncomeInformation: this.employmentInfoHelper.setupFormGroup(this.fb, FORM),
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
    const summaryDialogRef = this.matDialog.open(SummaryOfBenefitsDialog, { maxWidth: '800px !important', data: 'victim' });
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

  submitApplicationAndClone(type: string) {
    this.submitting = true;
    if (this.form.valid) {
      let thisForm = _.cloneDeep(this.form);
      this.justiceDataService.submitApplication(this.harvestForm())
        .subscribe(
          data => {
            if (data['isSuccess'] == true) {
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
      ApplicationType: this.FORM_TYPE,
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

  cloneFormToVictim(currentForm) {
    console.log("cloning Victim to Victim");
    console.log(currentForm);
    let ret = this.buildApplicationForm(ApplicationType.Victim_Application);

    ret.get('personalInformation').patchValue(currentForm.get('personalInformation').value);
    ret.get('personalInformation').get('permissionToContactViaMethod').patchValue(false);
    ret.get('personalInformation').get('agreeToCvapCommunicationExchange').patchValue('');
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

    for (let i = 0; i < authorizedPersonsLength; ++i) {
      authorizedPersons.push(this.authInfoHelper.createAuthorizedPerson(this.fb));
    }
    
    ret.get('authorizationInformation').patchValue(currentForm.get('authorizationInformation').value);
    ret.get('authorizationInformation').get('approvedAuthorityNotification').patchValue('');
    ret.get('authorizationInformation').get('readAndUnderstoodTermsAndConditions').patchValue('');
    ret.get('authorizationInformation').get('signature').patchValue('');

    return ret;
  }

  cloneFormToIFM(currentForm) {
    console.log("cloning Victim to IFM");
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
    ret.get('personalInformation').get('gender').patchValue(0);
    ret.get('personalInformation').get('birthDate').patchValue('');
    ret.get('personalInformation').get('sin').patchValue('');
    ret.get('personalInformation').get('occupation').patchValue('');
    ret.get('personalInformation').get('agreeToCvapCommunicationExchange').patchValue('');
    
    ret.get('victimInformation').patchValue(currentForm.get('personalInformation').value);
    ret.get('victimInformation').get('mostRecentMailingAddressSameAsPersonal').patchValue(true);
    
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

    return ret;
  }
}
