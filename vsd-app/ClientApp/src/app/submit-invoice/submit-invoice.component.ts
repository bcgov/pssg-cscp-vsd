import { CancelDialog } from '../shared/dialogs/cancel/cancel.dialog';
import { Component, OnInit, HostListener } from '@angular/core';
import { CounsellorInvoice } from '../interfaces/counsellor-invoice.interface';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { EnumHelper } from '../shared/enums-list';
import { FormBase } from '../shared/form-base';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { GSTWarningDialog } from '../shared/dialogs/gst-warning/gst-warning.dialog';
import { InvoiceInstructionsDialog } from '../shared/dialogs/invoice-instructions/invoice-instructions.dialog';
import { JusticeApplicationDataService } from '../services/justice-application-data.service';
import { MY_FORMATS } from '../shared/enums-list';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { POSTAL_CODE } from '../shared/regex.constants';
import { SignPadDialog } from '../sign-dialog/sign-dialog.component';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { AEMService } from '../services/aem.service';
import * as moment from 'moment';
import { DocumentCollectioninformation } from '../interfaces/application.interface';
import { MessageDialog } from '../shared/dialogs/message-dialog/message.dialog';

@Component({
  selector: 'app-submit-invoice',
  templateUrl: './submit-invoice.component.html',
  styleUrls: ['./submit-invoice.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})

export class SubmitInvoiceComponent extends FormBase implements OnInit {
  postalRegex = POSTAL_CODE;
  dataLoaded = false;
  submitting: boolean = false;
  hasDuplicateLineItem: boolean = false;

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

  public counsellor_level: number = 0;

  today = new Date();

  saveFormData: any;

  isIE: boolean = false;

  constructor(
    private justiceDataService: JusticeApplicationDataService,
    private fb: FormBuilder,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private aemService: AEMService,
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
    let invoice = <CounsellorInvoice>{
      InvoiceDetails: this.form.get('invoiceDetails').value,
    };
    invoice.InvoiceDetails.exemptFromGst = !invoice.InvoiceDetails.gstApplicable;
    console.log(invoice);
    let invoiceDate = moment(invoice.InvoiceDetails.invoiceDate).toDate();
    let date_string = invoiceDate.getFullYear() + MONTHS[invoiceDate.getMonth()] + invoiceDate.getDate();


    this.getAEMPDF().then((pdf: string) => {
      let downloadLink = document.createElement("a");
      downloadLink.href = "data:application/pdf;base64," + pdf;
      downloadLink.download = `Invoice-${invoice.InvoiceDetails.invoiceNumber}-${date_string}.pdf`;
      downloadLink.target = "_blank";

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }).catch((err) => {
      console.log("error getting pdf");
      console.log(err);
    });

  }

  @HostListener('window:afterprint')
  onafterprint() {
    document.querySelectorAll(".slide-close")[0].classList.remove("hide-for-print")
    window.scroll(0, 0);

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
      if (this.hasDuplicateLineItem) {
        this.dialog.open(MessageDialog, {
          autoFocus: false,
          data: { title: "Duplicate Line Items", message: "Multiple line items detected with same session date and counselling type." }
        });
        return;
      }

      this.submitting = true;
      this.formFullyValidated = true;
      const formData = <CounsellorInvoice>{
        InvoiceDetails: this.form.get('invoiceDetails').value,
      };
      formData.InvoiceDetails.exemptFromGst = !formData.InvoiceDetails.gstApplicable;

      this.getInvoicePDF(formData).then((pdfs: DocumentCollectioninformation[]) => {
        formData.DocumentCollection = pdfs;

        this.save(formData).subscribe(
          data => {
            this.submitting = false;
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
            this.submitting = false;
            this.snackBar.open('Error submitting invoice', 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
            console.log('Error submitting invoice');
            if (this.isIE) {
              alert("Encountered an error. Please use another browser as this may resolve the problem.")
            }
          },
          () => { }
        );
      }).catch(err => {
        this.submitting = false;
        console.log(err);
      });
    } else {
      console.log("form not validated");
      this.formFullyValidated = false;
      this.markAsTouched();
    }
  }

  submitAndCreateNew() {
    //first submit, then
    if (this.form.valid) {
      if (this.hasDuplicateLineItem) {
        this.dialog.open(MessageDialog, {
          autoFocus: false,
          data: { title: "Duplicate Line Items", message: "Multiple line items detected with same session date and counselling type." }
        });
        return;
      }
      this.submitting = true;
      this.formFullyValidated = true;
      const formData = <CounsellorInvoice>{
        InvoiceDetails: this.form.get('invoiceDetails').value,
      };
      formData.InvoiceDetails.exemptFromGst = !formData.InvoiceDetails.gstApplicable;

      this.getInvoicePDF(formData).then((pdfs: DocumentCollectioninformation[]) => {
        formData.DocumentCollection = pdfs;

        this.save(formData).subscribe(
          data => {
            this.submitting = false;
            if (data['IsSuccess'] == true) {
              this.invoiceEdit();
              this.cloneInvoice(_.cloneDeep(this.form));
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
            this.submitting = false;
            this.snackBar.open('Error submitting invoice', 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
            console.log('Error submitting invoice');
            if (this.isIE) {
              alert("Encountered an error. Please use another browser as this may resolve the problem.")
            }
          },
          () => { }
        );

      }).catch(err => {
        this.submitting = false;
        console.log(err);
      });
    } else {
      console.log("form not validated");
      this.formFullyValidated = false;
      this.markAsTouched();
    }
  }

  save(formData: CounsellorInvoice): Subject<{}> {
    const subResult = new Subject<{}>();

    this.justiceDataService.submitCounsellorInvoice(formData)
      .subscribe(res => {
        subResult.next(res);
      }, err => subResult.next(false));


    return subResult;
  }

  getInvoicePDF(invoice: CounsellorInvoice) {
    return new Promise(async (resolve, reject) => {
      let ret: DocumentCollectioninformation[] = [];
      let promise_array = [];
      // console.log(invoice.InvoiceDetails.invoiceDate);
      let invoiceDate = moment(invoice.InvoiceDetails.invoiceDate).toDate();
      let date_string = invoiceDate.getFullYear() + MONTHS[invoiceDate.getMonth()] + invoiceDate.getDate();

      promise_array.push(new Promise<void>((resolve, reject) => {
        this.getAEMPDF().then((pdf: string) => {
          ret.push({
            body: pdf,
            filename: `Invoice-${invoice.InvoiceDetails.invoiceNumber}-${date_string}.pdf`,
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

  getAEMPDF(): Promise<string> {
    return new Promise((resolve, reject) => {
      let invoice = <CounsellorInvoice>{
        InvoiceDetails: this.form.get('invoiceDetails').value,
      };
      invoice.InvoiceDetails.exemptFromGst = !invoice.InvoiceDetails.gstApplicable;
      invoice.InvoiceDetails.claimantsFullName = invoice.InvoiceDetails.claimantsFirstName + ' ' + invoice.InvoiceDetails.claimantsLastName;

      invoice.InvoiceDetails.lineItems.forEach(line => {
        line.counsellingTypeName = COUNSELLING_TYPES[line.counsellingType];
      });

      this.aemService.getInvoicePDF(invoice).subscribe((res: any) => {
        console.log(res);
        if (res.responseMessage) {
          resolve(res.responseMessage);
        }
        else {
          reject(res);
        }
      },
        (err) => {
          reject(err);
          console.log(err);
        });
    });
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
    let vendorNumber = this.form.get('invoiceDetails.vendorNumber').value;
    let vendorPostalCode = this.form.get('invoiceDetails.vendorPostalCode').value;
    let counsellorNumber = this.form.get('invoiceDetails.counsellorRegistrationNumber').value;
    let counsellorLastName = this.form.get('invoiceDetails.counsellorLastName').value;
    switch (source) {
      case 'vendor': {
        if (vendorNumber && vendorPostalCode) {
          this.justiceDataService.validateVendor(vendorNumber, vendorPostalCode).subscribe((res: any) => {
            this.didValidateVendor = true;
            this.isVendorValid = res.IsSuccess;
          });
        }
        else {
          this.isVendorValid = false;
        }

        if (vendorNumber && vendorPostalCode && counsellorNumber && counsellorLastName) {
          this.justiceDataService.validateVendorAndCounsellor(vendorNumber, vendorPostalCode, counsellorNumber, counsellorLastName).subscribe((res: any) => {
            this.didValidateCounsellor = true;
            this.isCounsellorValid = res.IsSuccess;
            if (this.isCounsellorValid) {
              this.counsellor_level = res.CounsellorLevel;

              if (this.form.get('invoiceDetails.gstApplicable').value == true) {
                this.checkCousellorLevel();
              }
            }
          });
        }
        break;
      }
      case 'counsellor': {
        if (vendorNumber && vendorPostalCode && counsellorNumber && counsellorLastName) {
          this.justiceDataService.validateVendorAndCounsellor(vendorNumber, vendorPostalCode, counsellorNumber, counsellorLastName).subscribe((res: any) => {
            this.didValidateCounsellor = true;
            this.isCounsellorValid = res.IsSuccess;
            if (this.isCounsellorValid) {
              this.counsellor_level = res.CounsellorLevel;

              if (this.form.get('invoiceDetails.gstApplicable').value == true) {
                this.checkCousellorLevel();
              }
            }
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

  checkCousellorLevel() {
    if (this.form.get('invoiceDetails.gstApplicable').value == true && (this.counsellor_level == 4 || this.counsellor_level == 5)) {
      let dialogRef = this.dialog.open(GSTWarningDialog, {
        autoFocus: false,
        data: {}
      });

      dialogRef.afterClosed().subscribe(() => {
        this.form.get('invoiceDetails.gstApplicable').patchValue(false);
      });
    }
  }

  checkForDuplicateLineItems() {
    let lineItems = this.form.get('invoiceDetails.lineItems') as FormArray;

    let data = [];
    for (let i = 0; i < lineItems.length; ++i) {
      let item = this.lineItems.at(i) as FormGroup;
      data.push({ type: item.get("counsellingType").value, date: item.get("sessionDate").value.toString() });
    }

    let duplicates = data.filter((d1, index, self) => self.findIndex(d2 => d1.type == d2.type && d1.date == d2.date) != index);

    if (duplicates.length > 0) {
      this.hasDuplicateLineItem = true;
      this.dialog.open(MessageDialog, {
        autoFocus: false,
        data: { title: "Duplicate Line Item", message: "This counselling type already entered for this date, please review session date." }
      });
    }
    else {
      this.hasDuplicateLineItem = false;
    }
  }
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const COUNSELLING_TYPES = {
  100000000: "Counselling Session",
  100000001: "Court Supporting Counselling",
  100000002: "Psycho-educational sessions",
}
