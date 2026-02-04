import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-gst-warning.dialog',
    templateUrl: 'gst-warning.dialog.html',
    standalone: false
})
export class GSTWarningDialog {
  constructor(public dialogRef: MatDialogRef<GSTWarningDialog>, @Inject(MAT_DIALOG_DATA) public data: any) {}

  onOkayClick() {
    this.dialogRef.close();
  }

  close() {
    this.dialogRef.close();
  }
}
