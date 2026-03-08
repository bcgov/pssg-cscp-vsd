import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LookupService } from '../../../../api/lookup/lookup.service';

@Component({
  selector: 'app-invoice-instructions.dialog',
  templateUrl: 'invoice-instructions.dialog.html',
  standalone: false
})
export class InvoiceInstructionsDialog implements OnInit {
  cvapEmail: string = '';
  cvapCounsellingEmail: string = '';

  constructor(
    public dialogRef: MatDialogRef<InvoiceInstructionsDialog>,
    private lookupService: LookupService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.lookupService.getApiLookupCvapEmails().subscribe((res) => {
      if (res) {
        this.cvapEmail = res.cvapEmail;
        this.cvapCounsellingEmail = res.cvapCounsellingEmail;
      }
    });
  }

  onOkayClick() {
    this.dialogRef.close();
  }

  close() {
    this.dialogRef.close();
  }
}
