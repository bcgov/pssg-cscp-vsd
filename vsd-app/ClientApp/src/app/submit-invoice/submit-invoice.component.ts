import { Component, OnInit } from '@angular/core';
import { User } from '../models/user.model';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
// tslint:disable-next-line:no-duplicate-imports
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SignPadDialog } from '../sign-dialog/sign-dialog.component';

import { JusticeApplicationDataService } from '../services/justice-application-data.service';
import { FormBase } from '../shared/form-base';
import { EnumHelper } from '../shared/enums-list';
import { MY_FORMATS } from '../shared/enums-list';
import { CounsellorInvoice } from '../interfaces/counsellor-invoice.interface';
import { DynamicsApplicationModel } from '../models/dynamics-application.model';

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
  invoiceGrandTotal: number = 0.00;

  saveFormData: any;

  constructor(
    private justiceDataService: JusticeApplicationDataService,
    private fb: FormBuilder,
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

    this.form.get('invoiceDetails.doYouHaveCvapCounsellorNumber')
      .valueChanges
      .subscribe(value => {
        const counsellorRegistrationNumber = this.form.get('invoiceDetails.counsellorRegistrationNumber');

        const counsellorFirstName = this.form.get('invoiceDetails.counsellorFirstName');
        const counsellorLastName = this.form.get('invoiceDetails.counsellorLastName');
        const counsellorEmail = this.form.get('invoiceDetails.counsellorEmail');

        counsellorRegistrationNumber.clearValidators();
        counsellorRegistrationNumber.setErrors(null);
        counsellorFirstName.clearValidators();
        counsellorFirstName.setErrors(null);
        counsellorLastName.clearValidators();
        counsellorLastName.setErrors(null);
        counsellorEmail.clearValidators();
        counsellorEmail.setErrors(null);

        const validateNumber = value === true;
        if (validateNumber) {
          counsellorRegistrationNumber.setValidators([Validators.required]);
        }

        if (!validateNumber) {
          counsellorFirstName.setValidators([Validators.required]);
          counsellorLastName.setValidators([Validators.required]);
          counsellorEmail.setValidators([Validators.required, Validators.email]);
        }

        counsellorRegistrationNumber.updateValueAndValidity();
        counsellorFirstName.updateValueAndValidity();
        counsellorLastName.updateValueAndValidity();
        counsellorEmail.updateValueAndValidity();
      });

    this.form.get('invoiceDetails.doYouHaveVendorNumberOnFile')
      .valueChanges
      .subscribe(value => {
        const vendorNumber = this.form.get('invoiceDetails.vendorNumber');

        const vendorName = this.form.get('invoiceDetails.vendorName');
        const vendorEmail = this.form.get('invoiceDetails.vendorEmail');

        vendorNumber.clearValidators();
        vendorNumber.setErrors(null);
        vendorName.clearValidators();
        vendorName.setErrors(null);
        vendorEmail.clearValidators();
        vendorEmail.setErrors(null);

        const validateNumber = value === true;
        if (validateNumber) {
          vendorNumber.setValidators([Validators.required]);
        }

        if (!validateNumber) {
          vendorName.setValidators([Validators.required]);
          vendorEmail.setValidators([Validators.required, Validators.email]);
        }

        vendorNumber.updateValueAndValidity();
        vendorName.updateValueAndValidity();
        vendorEmail.updateValueAndValidity();
      });
  }

  debugFormData(): void {
    let formData = {
      InvoiceDetails: this.form.get('invoiceDetails').value
    };

    console.log(JSON.stringify(formData));
    //console.log(formData);
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

  calculateRow(item): string {
    let rowTotal = parseFloat(item.get('sessionHours').value || 0);
    this.calculateAllTotals();
    return rowTotal.toFixed(2).toString();
  }

  calculateAllTotals(): void {
    let invoiceSubTotal = 0.00;
    let invoiceItems = <FormArray>this.form.get('invoiceDetails.lineItems');
    invoiceItems.controls.forEach(item => {
      let sessionHours = item.get('sessionHours').value || 0;
      invoiceSubTotal += sessionHours;
    });

    this.invoiceGrandTotal = invoiceSubTotal;
  }

  createLineItem(sessionHours: string = ''): FormGroup {
    return this.fb.group({
      counsellingType: [0, Validators.required],  // Counselling Session: 100000000  Court Support Counselling: 100000001  Psycho-educational sessions: 100000002    --- VALIDATE THESE NUMBERS ARE CORRECT
      sessionDate: ['', Validators.required],
      sessionHours: [sessionHours, Validators.required],
      sessionAmount: [0],  // used for row calculation, not required for submission - could probably subscribe to value changes on controls that need it
    });
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

  isControlValid(formControl: FormGroup, field: string) {
    let formField = formControl;
    if (formField == null)
      return true;

    return formField.controls[field].valid || !formField.controls[field].touched;
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
      this.save().subscribe(
        data => {
          console.log (data);
          if (data['isSuccess'] == true) {
            console.log(data['isSuccess']);
            console.log("submitting");
            this.invoiceSuccess();
          }
          else {
            this.snackBar.open('Error submitting invoice', 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
            console.log('Error submitting invoice');
          }
        },
        error => {
          this.snackBar.open('Error submitting invoice', 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
          console.log('Error submitting invoice');
        },
        () => {}
      );
    } else {
      console.log("form not validated");
      this.formFullyValidated = false;
      this.markAsTouched();
    }
  }

  save(): Subject<{}> {
    const subResult = new Subject<{}>();
    const formData = <CounsellorInvoice>{
      InvoiceDetails: this.form.get('invoiceDetails').value,
    };

    //this.justiceDataService.submitCounsellorInvoice(formData).subscribe
    //  (res => {
    //    console.log(res);
    //      subResult.next(res);
    //    }, err => subResult.next(false));
    this.busy = this.justiceDataService.submitCounsellorInvoice(formData)
      .toPromise()
      .then(res => {
        subResult.next(res);
      }, err => subResult.next(false));
    this.busy2 = Promise.resolve(this.busy);

    return subResult;
  }

  markAsTouched() {
    this.validateAllFormFields(this.form.get('invoiceDetails'));
  }

  private buildInvoiceForm(): FormGroup {
    return this.fb.group({
      invoiceDetails: this.fb.group({

        registeredCounsellorWithCvap: ['', Validators.required],
        doYouHaveCvapCounsellorNumber: ['', Validators.required],
        doYouHaveVendorNumberOnFile: ['', Validators.required],

        // doYouHaveCvapCounsellorNumber == true
        counsellorRegistrationNumber: [''],

        // doYouHaveCvapCounsellorNumber == false
        counsellorFirstName: [''],
        counsellorLastName: [''],
        counsellorEmail: [''],

        // doYouHaveVendorNumberOnFile == true
        vendorNumber: [''],

        // doYouHaveVendorNumberOnFile == false
        vendorName: [''],
        vendorEmail: [''],

        claimNumber: ['', Validators.required],
        claimantsName: ['', Validators.required],
        invoiceNumber: ['', Validators.required],
        invoiceDate: ['', Validators.required],

        descriptionOfServicesProvided: [''],

        exemptFromGst: [false],

        lineItems: this.fb.array([this.createLineItem()], Validators.minLength(1)),

        declaredAndSigned: ['', Validators.required],
        signature: ['', Validators.required],
      }),
    });
  }
}
