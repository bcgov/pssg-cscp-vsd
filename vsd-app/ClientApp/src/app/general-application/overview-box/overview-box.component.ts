import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { SummaryOfBenefitsDialog } from '../../summary-of-benefits/summary-of-benefits.component';

@Component({
  selector: 'app-overview-box',
  templateUrl: './overview-box.component.html',
  styleUrls: ['./overview-box.component.scss']
})
export class OverviewBoxComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
  }
  showSummaryOfBenefits(): void {
    const summaryDialogRef = this.dialog.open(SummaryOfBenefitsDialog, { maxWidth: '800px !important', data: 'ifm' });
  }

}
