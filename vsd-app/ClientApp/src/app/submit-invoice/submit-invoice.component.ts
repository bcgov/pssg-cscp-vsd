import { Component, OnInit } from '@angular/core';
import { User } from '../models/user.model';
import { Subscription, Observable, Subject, forkJoin } from 'rxjs';
import { FormBuilder, FormGroup, Validators, FormArray, ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { defaultFormat as _rollupMoment } from 'moment';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SignPadDialog } from '../sign-dialog/sign-dialog.component';

import { JusticeApplicationDataService } from '../services/justice-application-data.service';
import { DynamicsApplicationModel } from '../models/dynamics-application.model';
import { FormBase } from '../shared/form-base';
import { EnumHelper } from '../shared/enums-list';

const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'YYYY-MM-DD',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export const postalRegex = '(^\\d{5}([\-]\\d{4})?$)|(^[A-Za-z][0-9][A-Za-z]\\s?[0-9][A-Za-z][0-9]$)';

@Component({
  selector: 'app-submit-invoice',
  templateUrl: './submit-invoice.component.html',
  styleUrls: ['./submit-invoice.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})

export class SubmitInvoiceComponent extends FormBase implements OnInit {
  currentUser: User;
  dataLoaded = false;
  busy: Promise<any>;
  busy2: Promise<any>;
  busy3: Promise<any>;

  form: FormGroup;
  enumHelper = new EnumHelper();

  formFullyValidated: boolean;
  formSubmitted: boolean = false;

  lineItems: FormArray;
  lineItemsControls: FormArray;

  showRemoveLine: boolean = false;

  public showFormPanel: boolean = true;
  public showReviewPanel: boolean = false;
  public showSuccessPanel: boolean = false;
  public showCancelPanel: boolean = false;
  
  invoiceSubTotal: number = 0.00;
  invoiceGstTotal: number = 0.00;
  invoiceGrandTotal: number = 0.00;

  saveFormData: any;

  constructor(
    private justiceDataService: JusticeApplicationDataService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    super();
    this.formFullyValidated = false;
  }

  ngOnInit() {
    this.form = this.buildInvoiceForm();
    this.lineItems = this.form.get('invoiceDetails.lineItems') as FormArray;
    this.lineItemsControls = this.form.get('invoiceDetails.lineItems') as FormArray;
  }
  
  debugFormData(): void {
    let formData = {
      InvoiceDetails: this.form.get('invoiceDetails').value
    };

    //console.log(JSON.stringify(formData));
    console.log(formData);
  }

  invoiceEdit(): void {
    window.scroll(0, 0);

    this.showFormPanel = true;
    this.showReviewPanel = false;
    this.showSuccessPanel = false;
    this.showCancelPanel = false;
  }

  invoiceReview(): void {
    window.scroll(0, 0);

    this.showFormPanel = false;
    this.showReviewPanel = true;
    this.showSuccessPanel = false;
    this.showCancelPanel = false;
  }

  invoiceSuccess(): void {
    window.scroll(0, 0);
    this.showFormPanel = false;
    this.showReviewPanel = false;
    this.showSuccessPanel = true;
    this.showCancelPanel = false;
  }

  invoiceCancel($event): void {
    window.scroll(0, 0);

    $event.preventDefault();
    this.showFormPanel = false;
    this.showReviewPanel = false;
    this.showSuccessPanel = false;
    this.showCancelPanel = true;
  }

  calculateRowTotal(event, rowIndex): void {
    console.log(rowIndex);
    console.log(event.target.value);
  }

  calculateRow(item): string {
    let hourlyRate = parseFloat(this.form.get('invoiceDetails.counsellingHourlyRate').value || 0);
    let rowTotal = parseFloat(item.get('sessionHours').value || 0) * hourlyRate;
    this.calculateAllTotals();
    return rowTotal.toFixed(2).toString();
  }

  calculateAllTotals(): void {
    let exemptFromGst = this.form.get('invoiceDetails.exemptFromGst').value === true;
    let hourlyRate = this.form.get('invoiceDetails.counsellingHourlyRate').value;
    const gstRate = exemptFromGst ? 0.00 : 0.05;

    let invoiceSubTotal = 0.00;
    let invoiceItems = <FormArray>this.form.get('invoiceDetails.lineItems');
    invoiceItems.controls.forEach(item => {
      let sessionHours = item.get('sessionHours').value || 0;
      let rowTotal = sessionHours * hourlyRate;
      invoiceSubTotal += rowTotal;
    });

    let invoiceGstTotal = invoiceSubTotal * gstRate;
    this.invoiceSubTotal = invoiceSubTotal;
    this.invoiceGstTotal = invoiceGstTotal;
    this.invoiceGrandTotal = invoiceSubTotal + invoiceGstTotal;
  }

  createLineItem(sessionHours: string = ''): FormGroup {
    return this.fb.group({
      counsellingType: [0, Validators.required],  // Counselling Session: 100000000  Court Support Counselling: 100000001  Psycho-educational sessions: 100000002    --- VALIDATE THESE NUMBERS ARE CORRECT
      sessionDate: ['', Validators.required],
      sessionHours: [sessionHours, Validators.required],
      sessionAmount: [0],  // used for row calculation, not required for submission - could probably subscribe to value changes on controls that need it
    });
  }

  showSignPad(group, control): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(SignPadDialog, dialogConfig);
    dialogRef.afterClosed().subscribe(
      data => {
        var patchObject = {};
        patchObject[control] = data;
        this.form.get(group).patchValue(
          patchObject
        );
      }
    );
  }

  validateAllFormFields(formGroup: any) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);

      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  getErrors(formGroup: any, errors: any = {}) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        errors[field] = control.errors;
      } else if (control instanceof FormGroup) {
        errors[field] = this.getErrors(control);
      }
    });
    return errors;
  }

  isFieldValid(field: string) {
    let formField = this.form.get(field);
    if (formField == null)
      return true;

    return this.form.get(field).valid || !this.form.get(field).touched;
  }

  isControlValid(formControl: FormGroup, field: string) {
    let formField = formControl;
    if (formField == null)
      return true;

    return formField.controls[field].valid || !formField.controls[field].touched;
  }


  isChildFieldValid(parent: string, field: string) {
    let formField = this.form.get(parent);
    if (formField == null)
      return true;

    return formField.get(field).valid || !formField.get(field).touched;
  }

  setLineItems(): void {
    let desiredLines = parseInt(this.form.get('invoiceDetails.settingsNumberOfSessions').value);
    let desiredDuration = parseFloat(this.form.get('invoiceDetails.settingsSessionDuration').value);

    let rate: string = '';
    let duration: string = '';

    this.lineItems = this.form.get('invoiceDetails.lineItems') as FormArray;
    while (this.lineItems.length !== 0) {
      this.lineItems.removeAt(0)
    }

    if (isNaN(desiredLines) || desiredLines < 0) {
      desiredLines = 1;
    }

    if (isNaN(desiredLines) || desiredLines > 10) {
      desiredLines = 10;
    }

    //if (!isNaN(desiredDuration))
      duration = desiredDuration.toString();

    let i: number; 
    for (i = 0; i < desiredLines; i++) {
      this.lineItems.push(this.createLineItem(duration));
    }

    this.showRemoveLine = this.lineItems.length > 1;
  }

  addLineItem(): void {
    this.lineItems = this.form.get('invoiceDetails.lineItems') as FormArray;
    this.lineItems.push(this.createLineItem());
    this.showRemoveLine = this.lineItems.length > 1;
  }

  removeLineItem(index: number): void {
    this.lineItems = this.form.get('invoiceDetails.lineItems') as FormArray;
    this.lineItems.removeAt(index);
    this.showRemoveLine = this.lineItems.length > 1;
  }

  submitPartialApplication() {
      this.formFullyValidated = true;
      this.save().subscribe(
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
  
  reviewInvoice() {
    this.formSubmitted = true;
    if (this.form.valid) {
      this.formFullyValidated = true;
      this.invoiceReview();
    } else {
      console.log("form not validated");
      this.formFullyValidated = false;
      this.markAsTouched();
    }
  }
  
  submitInvoice() {
    this.formSubmitted = true;
    if (this.form.valid) {
      this.formFullyValidated = true;
      this.invoiceSuccess();
      //this.save().subscribe(
      //data => {
      //  console.log("submitting");
      //  this.router.navigate(['/application-success']);
      //},
      //err => {
      //  this.snackBar.open('Error submitting application', 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
      //  console.log('Error submitting invoice');
      //);
    } else {
      console.log("form not validated");
      this.formFullyValidated = false;
      this.markAsTouched();
    }
  }

  save(): Subject<boolean> {
    const subResult = new Subject<boolean>();
    const formData = <DynamicsApplicationModel>{
      PersonalInformation: this.form.get('invoiceDetails').value,
    };

    // This is the wrong action to call...
    this.busy = this.justiceDataService.submitApplication(formData)
        .toPromise()
        .then(res => {
          subResult.next(true);
        }, err => subResult.next(false));
    this.busy2 = Promise.resolve(this.busy);

    return subResult;
  }

  // marking the form as touched makes the validation messages show
  markAsTouched() {
    this.form.get('invoiceDetails').markAsTouched();

    const invoiceControls = (<FormGroup>(this.form.get('invoiceDetails'))).controls;
    for (const a in invoiceControls) {
      if (typeof (invoiceControls[a].markAsTouched) === 'function') {
        invoiceControls[a].markAsTouched();
      }
    }

    const invoiceItemControls = (<FormGroup>(this.form.get('invoiceDetails.lineItems'))).controls;
    for (const c in invoiceItemControls) {
      console.log(c);
      if (typeof (invoiceItemControls[c].markAsTouched) === 'function') {
        invoiceItemControls[c].markAsTouched();
      }
    }
  }

  private buildInvoiceForm(): FormGroup {
    return this.fb.group({
      invoiceDetails: this.fb.group({

        registeredCounsellorWithCvap: ['', Validators.required],
        doYouHaveCvapCounsellorNumber: ['', Validators.required],
        doYouHaveVendorNumberOnFile: ['', Validators.required],
        doYouHavePaymentMethodOnFile: ['', Validators.required],

        // doYouHaveCvapCounsellorNumber == true
        counsellorRegistrationNumber: [''],

        // doYouHaveCvapCounsellorNumber == false
        counsellorFirstName: [''],
        counsellorLastName: [''],
        counsellorPhoneNumber: [''],
        counsellorEmail: [''],
        counsellorOrganisationName: [''],

        // doYouHaveVendorNumberOnFile == true
        vendorNumber: [''],

        // doYouHaveVendorNumberOnFile == false
        vendorName: [''],
        vendorEmail: [''],
        vendorPhoneNumber: [''],

        claimNumber: ['', Validators.required],
        claimantsName: ['', Validators.required],
        invoiceNumber: ['', Validators.required],
        invoiceDate: ['', Validators.required],

        counsellingHourlyRate: [0],
        descriptionOfServicesProvided: [''],

        // Pull these out into a new subsection -- ignore on submission
        settingsNumberOfSessions: [''],
        settingsCounsellingRate: [''],
        settingsSessionDuration: [''], // , Validators.pattern("/^[0-9]+(\.[0-9]{1,2})?$/")
        exemptFromGst: [false],

        lineItems: this.fb.array([this.createLineItem()]),

        declaredAndSigned: ['', Validators.required],
        signature: ['', Validators.required],
      }),
    });
  }
}
/*
 * table row binds:
 * {{ item.get('sessionDate').value }}
 * {{ enumHelper.InvoiceCounsellingType[valueForEnum(item.get('counsellingType'))] }}
 * {{ item.get('sessionHours').value }}
 */
