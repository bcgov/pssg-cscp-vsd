import { Component, OnInit, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-guard-dialog',
  templateUrl: './guard-dialog.component.html'
})
export class DeactivateGuardDialog implements OnInit {

  //navigateAwaySelection$: Subject<boolean> = new Subject<boolean>();
  goAway: boolean;
  subject: Subject<boolean> = new Subject<boolean>();

  constructor(
    public dialogRef: MatDialogRef<DeactivateGuardDialog>,
    private router: Router,
    private route: ActivatedRoute,
    
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  choose(choice: boolean): void {
    this.dialogRef.close(choice);
    this.subject.next(choice);
    this.subject.complete();
  }

  ngOnInit() {
    
  }
}
