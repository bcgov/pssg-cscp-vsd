import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-invoice-instructions.dialog',
  templateUrl: 'invoice-instructions.dialog.html',
})
export class InvoiceInstructionsDialog {
  constructor(public dialogRef: MatDialogRef<InvoiceInstructionsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  onOkayClick() {
    this.dialogRef.close();
  }

  close() {
    this.dialogRef.close();
  }
}
