import { Component, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-gst-warning.dialog',
  templateUrl: 'gst-warning.dialog.html'
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
