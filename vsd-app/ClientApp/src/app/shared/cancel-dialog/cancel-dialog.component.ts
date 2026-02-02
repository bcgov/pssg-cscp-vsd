import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-cancel-dialog',
  templateUrl: './cancel-dialog.component.html'
})
export class CancelApplicationDialog implements OnInit {
  applicationType: string;

  constructor(
    public dialogRef: MatDialogRef<CancelApplicationDialog>,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  closeMe(): void {
    this.dialogRef.close(false);
  }

  cancelApplication(): void {
    this.dialogRef.close(true);
  }

  ngOnInit() {
    this.applicationType = this.data;
  }
}
