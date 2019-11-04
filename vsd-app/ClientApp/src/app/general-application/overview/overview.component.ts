import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SummaryOfBenefitsDialog } from '../../summary-of-benefits/summary-of-benefits.component';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
  ) { }

  ngOnInit() { }
  showSummaryOfBenefits(): void {
    const summaryDialogRef = this.dialog.open(SummaryOfBenefitsDialog, { maxWidth: '800px !important', data: 'ifm' });
  }
}
