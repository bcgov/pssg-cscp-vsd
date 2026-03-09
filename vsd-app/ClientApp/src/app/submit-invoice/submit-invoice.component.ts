import { Component, HostListener, inject, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as _ from 'lodash';
import moment from 'moment';
import { InvoicesService } from '../../api/invoices/invoices.service';
import { DocumentDto, InvoiceDto } from '../../model';
import { AEMService } from '../services/aem.service';
import { JusticeApplicationDataService } from '../services/justice-application-data.service';
import { LookupService } from '../services/lookup.service';
import { CancelDialog } from '../shared/dialogs/cancel/cancel.dialog';
import { GSTWarningDialog } from '../shared/dialogs/gst-warning/gst-warning.dialog';
import { InvoiceInstructionsDialog } from '../shared/dialogs/invoice-instructions/invoice-instructions.dialog';
import { MessageDialog } from '../shared/dialogs/message-dialog/message.dialog';
import { EnumHelper, MY_FORMATS } from '../shared/enums-list';
import { FormBase } from '../shared/form-base';
import { POSTAL_CODE } from '../shared/regex.constants';
import { ServiceNotAvailableComponent } from '../shared/service-not-available.component';
import { EmailValidator } from '../shared/validators/email.validator';
import { SignPadDialog } from '../sign-dialog/sign-dialog.component';

@Component({
  selector: 'app-submit-invoice',
  templateUrl: './submit-invoice.component.html',
  styleUrls: ['./submit-invoice.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ],
  standalone: false
})
export class SubmitInvoiceComponent extends FormBase implements OnInit {
  invoiceService = inject(InvoicesService);

  postalRegex = POSTAL_CODE;
  dataLoaded = false;
  submitting: boolean = false;
  hasDuplicateLineItem: boolean = false;

  form: UntypedFormGroup;
  enumHelper = new EnumHelper();

  formFullyValidated: boolean;
  formSubmitted: boolean = false;

  lineItems: UntypedFormArray;
  lineItemsControls: UntypedFormArray;

  showRemoveLine: boolean = false;

  public showFormPanel: boolean = true;
  public showReviewPanel: boolean = false;
  public showSuccessPanel: boolean = false;
  public showCancelPanel: boolean = false;
  public showPrintView: boolean = false;

  invoiceSubTotal: number = 0.0;
  invoiceGrandTotal: number = 0.0;

  isVendorValid: boolean = false;
  didValidateVendor: boolean = false;
  isCounsellorValid: boolean = false;
  didValidateCounsellor: boolean = false;

  public counsellor_level: number = 0;

  today = new Date();

  saveFormData: any;

  isIE: boolean = false;

  cvapEmail: string = '';
  cvapCounsellingEmail: string = '';

  constructor(
    private justiceDataService: JusticeApplicationDataService,
    private fb: UntypedFormBuilder,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private aemService: AEMService,
    private lookupService: LookupService
  ) {
    super();
    this.formFullyValidated = false;
  }

  ngOnInit() {
    var ua = window.navigator.userAgent;
    this.isIE = /MSIE|Trident/.test(ua);

    this.form = this.buildInvoiceForm();
    this.lineItems = this.form.get('invoiceDetails.lineItems') as UntypedFormArray;
    this.lineItemsControls = this.form.get('invoiceDetails.lineItems') as UntypedFormArray;

    if (this.lookupService.cvapEmail) {
      this.cvapEmail = this.lookupService.cvapEmail;
      this.cvapCounsellingEmail = this.lookupService.cvapCounsellingEmail;
    } else {
      this.lookupService.getCVAPEmails().subscribe((res) => {
        this.cvapEmail = res.cvapEmail;
        this.cvapCounsellingEmail = res.cvapCounsellingEmail;
      });
    }

    this.form.valueChanges.subscribe(() => {
      this.formFullyValidated = !this.hasInvalidTouchedControls(this.form);
    });
  }

  resetForm() {
    this.form.reset();
    this.form = this.buildInvoiceForm();
    this.lineItems = this.form.get('invoiceDetails.lineItems') as UntypedFormArray;
    this.lineItemsControls = this.form.get('invoiceDetails.lineItems') as UntypedFormArray;
    this.formFullyValidated = false;
    this.formSubmitted = false;
    this.showFormPanel = true;
    this.showReviewPanel = false;
    this.showSuccessPanel = false;
    this.showCancelPanel = false;
    this.invoiceSubTotal = 0.0;
    this.invoiceGrandTotal = 0.0;
    this.isVendorValid = false;
    this.didValidateVendor = false;
    this.isCounsellorValid = false;
    this.didValidateCounsellor = false;
    this.showRemoveLine = false;
    this.hasDuplicateLineItem = false;
  }

  showInvoiceInstructions() {
    this.dialog.open(InvoiceInstructionsDialog, {
      autoFocus: false,
      data: {}
    });
  }

  printInvoice() {
    let invoice = <InvoiceDto>{
      invoiceDetails: this.form.get('invoiceDetails').value
    };
    invoice.invoiceDetails.exemptFromGst = !invoice.invoiceDetails.gstApplicable;
    let invoiceDate = moment(invoice.invoiceDetails.invoiceDate).toDate();
    let date_string = invoiceDate.getFullYear() + MONTHS[invoiceDate.getMonth()] + invoiceDate.getDate();

    this.getAEMPDF()
      .then((pdf: string) => {
        let downloadLink = document.createElement('a');
        downloadLink.href = 'data:application/pdf;base64,' + pdf;
        downloadLink.download = `Invoice-${invoice.invoiceDetails.invoiceNumber}-${date_string}.pdf`;
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

  @HostListener('window:afterprint')
  onafterprint() {
    document.querySelectorAll('.slide-close')[0].classList.remove('hide-for-print');
    window.scroll(0, 0);

    this.showPrintView = false;
  }

  invoiceEdit(id: string = ''): void {
    this.showFormPanel = true;
    this.showReviewPanel = false;
    this.showSuccessPanel = false;
    this.showCancelPanel = false;

    setTimeout(() => {
      if (!id) {
        window.scroll(0, 0);
      } else {
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
      data: { type: 'Invoice' }
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
    let invoiceSubTotal = 0.0;
    let invoiceItems = <UntypedFormArray>this.form.get('invoiceDetails.lineItems');
    invoiceItems.controls.forEach((item) => {
      let sessionHours = item.get('sessionHours').value || 0;
      invoiceSubTotal += sessionHours;
    });

    this.invoiceGrandTotal = invoiceSubTotal;
  }

  createLineItem(sessionHours: string = ''): UntypedFormGroup {
    const lineItemGroup = this.fb.group({
      counsellingType: [0, [Validators.required, Validators.min(100000000)]], // Counselling Session: 100000000  Court Support Counselling: 100000001  Psycho-educational sessions: 100000002    --- VALIDATE THESE NUMBERS ARE CORRECT
      missedSession: [false],
      sessionDate: ['', Validators.required],
      sessionHours: [0, [Validators.required, Validators.min(0.5)]],
      sessionAmount: [0], // used for row calculation, not required for submission - could probably subscribe to value changes on controls that need it
      attendingSupportPerson: ['']
    });

    lineItemGroup.get('counsellingType').valueChanges.subscribe((counsellingType) => {
      const attendingSupportPersonControl = lineItemGroup.get('attendingSupportPerson');
      if (counsellingType === '100000002') {
        attendingSupportPersonControl.setValidators([Validators.required]);
      } else {
        attendingSupportPersonControl.clearValidators();
        attendingSupportPersonControl.setValue('');
      }
      attendingSupportPersonControl.updateValueAndValidity();
    });

    return lineItemGroup;
  }

  addLineItem(): void {
    this.lineItems = this.form.get('invoiceDetails.lineItems') as UntypedFormArray;
    this.lineItems.push(this.createLineItem());
    this.showRemoveLine = this.lineItems.length > 1;
  }

  removeLineItem(index: number): void {
    this.lineItems = this.form.get('invoiceDetails.lineItems') as UntypedFormArray;
    this.lineItems.removeAt(index);
    this.showRemoveLine = this.lineItems.length > 1;
    this.checkForDuplicateLineItems();
  }

  showSignPad(group, control): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(SignPadDialog, dialogConfig);
    dialogRef.afterClosed().subscribe((data) => {
      var patchObject = {};
      patchObject[control] = data;
      this.form.get(group).patchValue(patchObject);
    });
  }

  isControlValid(formControl: UntypedFormGroup, field: string) {
    let formField = formControl;
    if (formField == null) return true;

    return formField.controls[field].valid || !formField.controls[field].touched;
  }

  reviewInvoice() {
    this.formSubmitted = true;
    if (this.form.valid) {
      this.formFullyValidated = true;
      this.invoiceReview();
    } else {
      console.log('form not validated');
      this.formFullyValidated = false;
      this.markAsTouched();
    }
  }

  private submit(formData: InvoiceDto): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getInvoicePDF(formData)
        .then((pdfs: DocumentDto[]) => {
          formData.documentCollection = pdfs;
          this.invoiceService.postApiInvoices(formData).subscribe({
            next: (data) => {
              if (data['success']) {
                resolve();
              } else {
                reject();
              }
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

  submitInvoiceAndClose() {
    this.markAsTouched();

    if (this.form.invalid) {
      this.formFullyValidated = false;
      return;
    }

    if (this.hasDuplicateLineItem) {
      this.dialog.open(MessageDialog, {
        autoFocus: false,
        data: { title: DUPLICATE_LINE_ITEMS_TITLE, message: DUPLICATE_LINE_ITEMS_MESSAGE }
      });
      return;
    }

    this.submitting = true;
    this.formFullyValidated = true;

    const formData = <InvoiceDto>{
      invoiceDetails: this.form.get('invoiceDetails').value
    };
    formData.invoiceDetails.exemptFromGst = !formData.invoiceDetails.gstApplicable;

    this.submit(formData)
      .then(() => {
        this.invoiceSuccess();
      })
      .catch(() => {
        this.submitErrorHandler();
      })
      .finally(() => {
        this.submitting = false;
      });
  }

  submitAndCreateNew() {
    this.markAsTouched();

    if (this.form.invalid) {
      this.formFullyValidated = false;
      return;
    }

    if (this.hasDuplicateLineItem) {
      this.dialog.open(MessageDialog, {
        autoFocus: false,
        data: { title: DUPLICATE_LINE_ITEMS_TITLE, message: DUPLICATE_LINE_ITEMS_MESSAGE }
      });
      return;
    }

    this.submitting = true;
    this.formFullyValidated = true;

    let formClone = _.cloneDeep(this.form);
    const formData = <InvoiceDto>{
      invoiceDetails: this.form.get('invoiceDetails').value
    };
    formData.invoiceDetails.exemptFromGst = !formData.invoiceDetails.gstApplicable;

    this.submit(formData)
      .then(() => {
        this.invoiceEdit();
        this.cloneInvoice(formClone);
      })
      .catch(() => {
        this.submitErrorHandler();
      })
      .finally(() => {
        this.submitting = false;
      });
  }

  getInvoicePDF(invoice: InvoiceDto) {
    return new Promise(async (resolve, reject) => {
      let ret: DocumentDto[] = [];
      let promise_array = [];
      let invoiceDate = moment(invoice.invoiceDetails.invoiceDate).toDate();
      let date_string = invoiceDate.getFullYear() + MONTHS[invoiceDate.getMonth()] + invoiceDate.getDate();

      promise_array.push(
        new Promise<void>((resolve, reject) => {
          this.getAEMPDF()
            .then((pdf: string) => {
              ret.push({
                body: pdf,
                filename: `Invoice-${invoice.invoiceDetails.invoiceNumber}-${date_string}.pdf`,
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

  getAEMPDF(): Promise<string> {
    return new Promise((resolve, reject) => {
      let invoice = <InvoiceDto>{
        invoiceDetails: this.form.get('invoiceDetails').value
      };
      invoice.invoiceDetails.exemptFromGst = !invoice.invoiceDetails.gstApplicable;
      invoice.invoiceDetails.claimantsFullName =
        invoice.invoiceDetails.claimantsFirstName + ' ' + invoice.invoiceDetails.claimantsLastName;

      // TODO: remove after transition to counselling type names instead of numbers for line items
      invoice.invoiceDetails.lineItems.forEach((line) => {
        line.counsellingTypeName = COUNSELLING_TYPES[line.counsellingType] || '';
      });

      this.aemService.getInvoicePDF(invoice).subscribe(
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

  markAsTouched() {
    this.validateAllFormFields(this.form.get('invoiceDetails'));
  }

  private cloneInvoice(formCopy: UntypedFormGroup) {
    this.form.reset();
    this.form = this.buildInvoiceForm();
    this.lineItems = this.form.get('invoiceDetails.lineItems') as UntypedFormArray;
    this.lineItemsControls = this.form.get('invoiceDetails.lineItems') as UntypedFormArray;

    this.form
      .get('invoiceDetails.counsellorRegistrationNumber')
      .patchValue(formCopy.get('invoiceDetails.counsellorRegistrationNumber').value);
    this.form
      .get('invoiceDetails.counsellorLastName')
      .patchValue(formCopy.get('invoiceDetails.counsellorLastName').value);
    this.form.get('invoiceDetails.vendorNumber').patchValue(formCopy.get('invoiceDetails.vendorNumber').value);
    this.form.get('invoiceDetails.vendorPostalCode').patchValue(formCopy.get('invoiceDetails.vendorPostalCode').value);
    this.form
      .get('invoiceDetails.submitterFullName')
      .patchValue(formCopy.get('invoiceDetails.submitterFullName').value);
    this.form
      .get('invoiceDetails.submitterEmailAddress')
      .patchValue(formCopy.get('invoiceDetails.submitterEmailAddress').value);
  }

  private buildInvoiceForm(): UntypedFormGroup {
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
        submitterEmailAddress: ['', [Validators.required, EmailValidator()]],
        declaredAndSigned: ['', Validators.required]
      })
    });
  }

  checkVendorStatus(source: string) {
    this.form.get('invoiceDetails.vendorNumber').setValue(this.form.get('invoiceDetails.vendorNumber').value.trim());
    this.form
      .get('invoiceDetails.vendorPostalCode')
      .setValue(this.form.get('invoiceDetails.vendorPostalCode').value.trim());
    this.form
      .get('invoiceDetails.counsellorRegistrationNumber')
      .setValue(this.form.get('invoiceDetails.counsellorRegistrationNumber').value.trim());
    this.form
      .get('invoiceDetails.counsellorLastName')
      .setValue(this.form.get('invoiceDetails.counsellorLastName').value.trim());

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
        } else {
          this.isVendorValid = false;
        }

        if (vendorNumber && vendorPostalCode && counsellorNumber && counsellorLastName) {
          this.justiceDataService
            .validateVendorAndCounsellor(vendorNumber, vendorPostalCode, counsellorNumber, counsellorLastName)
            .subscribe((res: any) => {
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
          this.justiceDataService
            .validateVendorAndCounsellor(vendorNumber, vendorPostalCode, counsellorNumber, counsellorLastName)
            .subscribe((res: any) => {
              this.didValidateCounsellor = true;
              this.isCounsellorValid = res.IsSuccess;
              if (this.isCounsellorValid) {
                this.counsellor_level = res.CounsellorLevel;

                if (this.form.get('invoiceDetails.gstApplicable').value == true) {
                  this.checkCousellorLevel();
                }
              }
            });
        } else {
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
    if (
      this.form.get('invoiceDetails.gstApplicable').value == true &&
      (this.counsellor_level == 4 || this.counsellor_level == 5)
    ) {
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
    let lineItems = this.form.get('invoiceDetails.lineItems') as UntypedFormArray;

    let data = [];
    for (let i = 0; i < lineItems.length; ++i) {
      let item = this.lineItems.at(i) as UntypedFormGroup;
      data.push({ type: item.get('counsellingType').value, date: item.get('sessionDate').value.toString() });
    }

    let duplicates = data.filter(
      (d1, index, self) => self.findIndex((d2) => d1.type == d2.type && d1.date == d2.date) != index
    );

    if (duplicates.length > 0) {
      this.hasDuplicateLineItem = true;
      this.dialog.open(MessageDialog, {
        autoFocus: false,
        data: {
          title: 'Duplicate Line Item',
          message: 'This counselling type already entered for this date, please review session date.'
        }
      });
    } else {
      this.hasDuplicateLineItem = false;
    }
  }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COUNSELLING_TYPES = {
  100000000: 'Counselling Session',
  100000001: 'Court Supporting Counselling',
  100000002: 'Psycho-educational sessions'
};

const DUPLICATE_LINE_ITEMS_TITLE = 'Duplicate Line Items';
const DUPLICATE_LINE_ITEMS_MESSAGE =
  'Multiple line items detected with same session date and counselling type, please review line items before submitting this invoice.';
