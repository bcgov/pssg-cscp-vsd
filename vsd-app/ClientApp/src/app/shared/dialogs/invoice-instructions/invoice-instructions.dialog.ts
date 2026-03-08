import { Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LookupStore } from '../../../store/lookup.store';

@Component({
  selector: 'app-invoice-instructions.dialog',
  templateUrl: 'invoice-instructions.dialog.html',
  standalone: false
})
export class InvoiceInstructionsDialog implements OnInit {
  protected readonly lookupStore = inject(LookupStore);
  get cvapEmail(): string { return this.lookupStore.cvapEmail(); }
  get cvapCounsellingEmail(): string { return this.lookupStore.cvapCounsellingEmail(); }

  constructor(
    public dialogRef: MatDialogRef<InvoiceInstructionsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {}

  onOkayClick() {
    this.dialogRef.close();
  }

  close() {
    this.dialogRef.close();
  }
}
