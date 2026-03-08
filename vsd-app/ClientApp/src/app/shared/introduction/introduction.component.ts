import { Component, inject, Input, OnInit } from '@angular/core';
import { ControlContainer, UntypedFormGroup } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { LookupStore } from '../../store/lookup.store';
import { SummaryOfBenefitsDialog } from '../../summary-of-benefits/summary-of-benefits.component';
import { ApplicationType, MY_FORMATS } from '../enums-list';
import { FormBase } from '../form-base';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ],
  standalone: false
})
export class IntroductionComponent extends FormBase implements OnInit {
  @Input() formType: number;
  public form: UntypedFormGroup;
  ApplicationType = ApplicationType;
  applicant: string = '';

  isIE: boolean = false;
  protected readonly lookupStore = inject(LookupStore);
  get cvapEmail(): string { return this.lookupStore.cvapEmail(); }
  get cvapCounsellingEmail(): string { return this.lookupStore.cvapCounsellingEmail(); }

  constructor(
    private controlContainer: ControlContainer,
    private matDialog: MatDialog
  ) {
    super();
  }

  ngOnInit() {
    var ua = window.navigator.userAgent;
    this.isIE = /MSIE|Trident/.test(ua);

    this.form = <UntypedFormGroup>this.controlContainer.control;
    setTimeout(() => {
      this.form.markAsTouched();
    }, 0);
    // console.log("intro component");
    // console.log(this.form);

    if (this.formType === ApplicationType.Victim_Application) {
      this.applicant = 'Victims';
    } else if (this.formType === ApplicationType.IFM_Application) {
      this.applicant = 'Immediate Family Members';
    } else if (this.formType === ApplicationType.Witness_Application) {
      this.applicant = 'Witnesses';
    }
  }

  showSummaryOfBenefits(): void {
    const summaryDialogRef = this.matDialog.open(SummaryOfBenefitsDialog, { data: this.formType });
  }
}
