import { Component, OnInit, HostListener } from '@angular/core';
import { User } from '../models/user.model';
import { Subject, Subscription } from 'rxjs';
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
import { InvoiceInstructionsDialog } from '../shared/dialogs/invoice-instructions/invoice-instructions.dialog';
import { CancelDialog } from '../shared/dialogs/cancel/cancel.dialog';
import { POSTAL_CODE } from '../shared/regex.constants';
import * as _ from 'lodash';

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
  postalRegex = POSTAL_CODE;
  currentUser: User;
  dataLoaded = false;
  busy: Subscription;
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
  public showPrintView: boolean = false;

  invoiceSubTotal: number = 0.00;
  invoiceGrandTotal: number = 0.00;

  isVendorValid: boolean = false;
  didValidateVendor: boolean = false;
  isCounsellorValid: boolean = false;
  didValidateCounsellor: boolean = false;

  today = new Date();

  saveFormData: any;

  isIE: boolean = false;

  constructor(
    private justiceDataService: JusticeApplicationDataService,
    private fb: FormBuilder,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    super();
    this.formFullyValidated = false;
  }

  ngOnInit() {
    var ua = window.navigator.userAgent;
    this.isIE = /MSIE|Trident/.test(ua);


    this.form = this.buildInvoiceForm();
    this.lineItems = this.form.get('invoiceDetails.lineItems') as FormArray;
    this.lineItemsControls = this.form.get('invoiceDetails.lineItems') as FormArray;
  }

  showInvoiceInstructions() {
    this.dialog.open(InvoiceInstructionsDialog, {
      autoFocus: false,
      data: {}
    });
  }

  printInvoice() {
    window.scroll(0, 0);

    this.showPrintView = true;
    //hide slide close thing
    document.querySelectorAll(".slide-close")[0].classList.add("hide-for-print");

    setTimeout(() => {
      window.print();
    }, 100);
  }

  @HostListener('window:afterprint')
  onafterprint() {
    document.querySelectorAll(".slide-close")[0].classList.remove("hide-for-print")
    window.scroll(0, 0);
    // this.showFormPanel = false;
    // this.showReviewPanel = false;
    // this.showSuccessPanel = true;
    // this.showCancelPanel = false;

    this.showPrintView = false;
  }

  invoiceEdit(id: string = ""): void {
    this.showFormPanel = true;
    this.showReviewPanel = false;
    this.showSuccessPanel = false;
    this.showCancelPanel = false;

    setTimeout(() => {
      if (!id) {
        window.scroll(0, 0);
      }
      else {
        let el = document.getElementById(id);
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);

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

  showCancelDialog() {
    let self = this;
    let dialogRef = this.dialog.open(CancelDialog, {
      autoFocus: false,
      data: { type: "Invoice" }
    });

    dialogRef.afterClosed().subscribe((res: any) => {
      if (res.cancel) {
        self.invoiceCancel();
      }
    });
  }

  invoiceCancel(): void {
    window.scroll(0, 0);

    // $event.preventDefault();
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
      counsellingType: [0, [Validators.required, Validators.min(100000000)]],  // Counselling Session: 100000000  Court Support Counselling: 100000001  Psycho-educational sessions: 100000002    --- VALIDATE THESE NUMBERS ARE CORRECT
      missedSession: [false],
      sessionDate: ['', Validators.required],
      sessionHours: [0, [Validators.required, Validators.min(0.5)]],
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
          if (data['IsSuccess'] == true) {
            this.invoiceSuccess();
          }
          else {
            this.snackBar.open('Error submitting invoice. ' + data['message'], 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
            console.log('Error submitting invoice. ' + data['message']);
            if (this.isIE) {
              alert("Encountered an error. Please use another browser as this may resolve the problem.")
            }
          }
        },
        error => {
          this.snackBar.open('Error submitting invoice', 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
          console.log('Error submitting invoice');
          if (this.isIE) {
            alert("Encountered an error. Please use another browser as this may resolve the problem.")
          }
        },
        () => { }
      );
    } else {
      console.log("form not validated");
      this.formFullyValidated = false;
      this.markAsTouched();
    }
  }

  submitAndCreateNew() {
    //first submit, then
    if (this.form.valid) {
      const formData = <CounsellorInvoice>{
        InvoiceDetails: this.form.get('invoiceDetails').value,
      };
      formData.InvoiceDetails.exemptFromGst = !formData.InvoiceDetails.gstApplicable;
      this.busy = this.justiceDataService.submitCounsellorInvoice(formData).subscribe(
        data => {
          if (data['IsSuccess'] == true) {
            this.invoiceEdit();
            this.cloneInvoice(_.cloneDeep(this.form));
          }
          else {
            this.snackBar.open('Error submitting invoice. ' + data['message'], 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
            console.log('Error submitting invoice. ' + data['message']);
          }
        },
        error => {
          this.snackBar.open('Error submitting invoice', 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
          console.log('Error submitting invoice');
        },
        () => { }
      );
    } else {
      console.log("form not validated");
      this.formFullyValidated = false;
      this.markAsTouched();
    }
    // window.scroll(0, 0);
  }

  save(): Subject<{}> {
    const subResult = new Subject<{}>();
    const formData = <CounsellorInvoice>{
      InvoiceDetails: this.form.get('invoiceDetails').value,
    };
    this.busy = this.justiceDataService.submitCounsellorInvoice(formData)
      .subscribe(res => {
        subResult.next(res);
      }, err => subResult.next(false));
    this.busy2 = Promise.resolve(this.busy);

    return subResult;
  }

  markAsTouched() {
    this.validateAllFormFields(this.form.get('invoiceDetails'));
  }

  private cloneInvoice(formCopy: FormGroup) {
    this.form.reset();
    this.form = this.buildInvoiceForm();
    this.lineItems = this.form.get('invoiceDetails.lineItems') as FormArray;
    this.lineItemsControls = this.form.get('invoiceDetails.lineItems') as FormArray;

    this.form.get('invoiceDetails.counsellorRegistrationNumber').patchValue(formCopy.get('invoiceDetails.counsellorRegistrationNumber').value);
    this.form.get('invoiceDetails.counsellorLastName').patchValue(formCopy.get('invoiceDetails.counsellorLastName').value);
    this.form.get('invoiceDetails.vendorNumber').patchValue(formCopy.get('invoiceDetails.vendorNumber').value);
    this.form.get('invoiceDetails.vendorPostalCode').patchValue(formCopy.get('invoiceDetails.vendorPostalCode').value);
    this.form.get('invoiceDetails.submitterFullName').patchValue(formCopy.get('invoiceDetails.submitterFullName').value);
    this.form.get('invoiceDetails.submitterEmailAddress').patchValue(formCopy.get('invoiceDetails.submitterEmailAddress').value);
  }

  private buildInvoiceForm(): FormGroup {
    return this.fb.group({
      invoiceDetails: this.fb.group({
        counsellorRegistrationNumber: ['', [Validators.required]],
        counsellorLastName: ['', [Validators.required]],
        vendorNumber: ['', [Validators.required]],
        vendorPostalCode: ['', [Validators.required, Validators.pattern(this.postalRegex)]],

        claimNumber: ['', Validators.required],
        claimantsFirstName: ['', Validators.required],
        claimantsLastName: ['', Validators.required],
        invoiceNumber: ['', Validators.required],
        invoiceDate: ['', Validators.required],

        exemptFromGst: [false],
        gstApplicable: [false],

        lineItems: this.fb.array([this.createLineItem()], Validators.minLength(1)),

        submitterFullName: ['', Validators.required],
        submitterEmailAddress: ['', [Validators.required, Validators.email]],
        declaredAndSigned: ['', Validators.required],
      }),
    });
  }

  checkVendorStatus(source: string) {
    switch (source) {
      case 'vendor': {
        let vendorNumber = this.form.get('invoiceDetails.vendorNumber').value;
        let vendorPostalCode = this.form.get('invoiceDetails.vendorPostalCode').value;
        if (vendorNumber && vendorPostalCode) {
          this.justiceDataService.validateVendor(vendorNumber, vendorPostalCode).subscribe((res: any) => {
            this.didValidateVendor = true;
            this.isVendorValid = res.IsSuccess;
          });
        }
        else {
          this.isVendorValid = false;
        }
        break;
      }
      case 'counsellor': {
        let vendorNumber = this.form.get('invoiceDetails.vendorNumber').value;
        let vendorPostalCode = this.form.get('invoiceDetails.vendorPostalCode').value;
        let counsellorNumber = this.form.get('invoiceDetails.counsellorRegistrationNumber').value;
        let counsellorLastName = this.form.get('invoiceDetails.counsellorLastName').value;
        if (vendorNumber && vendorPostalCode && counsellorNumber && counsellorLastName) {
          this.justiceDataService.validateVendorAndCounsellor(vendorNumber, vendorPostalCode, counsellorNumber, counsellorLastName).subscribe((res: any) => {
            this.didValidateCounsellor = true;
            this.isCounsellorValid = res.IsSuccess;
          });
        }
        else {
          this.isCounsellorValid = false;
        }
        break;
      }
      default: {
        break;
      }
    }
  }
}
