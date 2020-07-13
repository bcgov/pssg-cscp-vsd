import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'app-cancel',
    templateUrl: 'cancel.dialog.html',
    styleUrls: ['./cancel.dialog.scss'],
})
export class CancelDialog {
    type: string = "Application";
    constructor(public dialogRef: MatDialogRef<CancelDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.type = data.type || "Application";
    }

    cancel() {
        this.dialogRef.close({cancel: true});
    }

    closeMe() {
        this.dialogRef.close({cancel: false});
    }
}
