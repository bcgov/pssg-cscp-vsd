import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LookupService } from '../../../services/lookup.service';

@Component({
  selector: 'app-invoice-instructions.dialog',
  templateUrl: 'invoice-instructions.dialog.html',
})
export class InvoiceInstructionsDialog implements OnInit {
  cvapEmail: string = "";
  cvapCounsellingEmail: string = "";

  constructor(public dialogRef: MatDialogRef<InvoiceInstructionsDialog>,
    private lookupService: LookupService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    if (this.lookupService.cvapEmail) {
      this.cvapEmail = this.lookupService.cvapEmail;
      this.cvapCounsellingEmail = this.lookupService.cvapCounsellingEmail;
    }
    else {
      this.lookupService.getCVAPEmails().subscribe((res) => {
        this.cvapEmail = res.cvapEmail;
        this.cvapCounsellingEmail = res.cvapCounsellingEmail;
      });
    }
  }


  onOkayClick() {
    this.dialogRef.close();
  }

  close() {
    this.dialogRef.close();
  }
}
