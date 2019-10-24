import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

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
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  closeMe(): void {
    this.dialogRef.close(false);
  }

  cancelApplication(): void {
    this.dialogRef.close(true);

    // Figure out how to pass this application Type to the cancelled page. Or re-work how Cancelled is done.
    //this.route.snapshot.data = this.applicationType;
    //this.router.navigate(['/application-cancelled']);

    console.log('cancel application');
  }

  ngOnInit() {
    this.applicationType = this.data;
  }
}
