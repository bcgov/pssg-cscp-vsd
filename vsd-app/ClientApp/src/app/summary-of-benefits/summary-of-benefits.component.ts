import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BenefitLists } from './benefit-list';
@Component({
  selector: 'app-summary-of-benefits-dialog',
  templateUrl: './summary-of-benefits.component.html',
  styleUrls: ['./summary-of-benefits.component.scss']
})
export class SummaryOfBenefitsDialog implements OnInit {

  benefitList: any;
  applicationType: string;

  showVictimBenefits: boolean = false;
  showFamilyBenefits: boolean = false;
  showWitnessBenefits: boolean = false;

  constructor(public dialogRef: MatDialogRef<SummaryOfBenefitsDialog>, @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  closeMe(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.applicationType = this.data;

    if (this.applicationType == 'victim') {
      this.benefitList = BenefitLists.VictimBenefitList;
    }

    if (this.applicationType == 'ifm') {
      this.benefitList = BenefitLists.IfmBenefitList;
    }

    if (this.applicationType == 'witness') {
      this.benefitList = BenefitLists.WitnessBenefitList;
    }
  }
}
