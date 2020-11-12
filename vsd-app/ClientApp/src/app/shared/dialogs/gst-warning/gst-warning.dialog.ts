import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-gst-warning.dialog',
  templateUrl: 'gst-warning.dialog.html',
})
export class GSTWarningDialog {
  constructor(public dialogRef: MatDialogRef<GSTWarningDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  onOkayClick() {
    this.dialogRef.close();
  }

  close() {
    this.dialogRef.close();
  }
}
