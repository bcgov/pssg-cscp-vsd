import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BenefitList } from './benefit-list';
@Component({
  selector: 'app-summary-of-benefits-dialog',
  templateUrl: './summary-of-benefits.component.html',
  styleUrls: ['./summary-of-benefits.component.scss']
})
export class SummaryOfBenefitsDialog implements OnInit {

  benefitList = BenefitList;

  constructor(public dialogRef: MatDialogRef<SummaryOfBenefitsDialog>) {
  }

  closeMe(): void {
    this.dialogRef.close();
  }
    
  ngOnInit() {
  }
}
