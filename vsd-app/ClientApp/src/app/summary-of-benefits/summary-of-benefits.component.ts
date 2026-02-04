import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApplicationType } from '../shared/enums-list';
import { BenefitLists } from './benefit-list';
@Component({
    selector: 'app-summary-of-benefits-dialog',
    templateUrl: './summary-of-benefits.component.html',
    styleUrls: ['./summary-of-benefits.component.scss'],
    standalone: false
})
export class SummaryOfBenefitsDialog implements OnInit {
  benefitList: any;
  formType: ApplicationType;
  ApplicationType = ApplicationType;

  showVictimBenefits: boolean = false;
  showFamilyBenefits: boolean = false;
  showWitnessBenefits: boolean = false;

  constructor(public dialogRef: MatDialogRef<SummaryOfBenefitsDialog>, @Inject(MAT_DIALOG_DATA) public data: any) {}

  closeMe(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.formType = this.data;

    if (this.formType == ApplicationType.Victim_Application) {
      this.benefitList = BenefitLists.VictimBenefitList;
    }

    if (this.formType == ApplicationType.IFM_Application) {
      this.benefitList = BenefitLists.IfmBenefitList;
    }

    if (this.formType == ApplicationType.Witness_Application) {
      this.benefitList = BenefitLists.WitnessBenefitList;
    }
  }
}
