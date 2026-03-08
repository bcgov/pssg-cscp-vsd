import { Component, inject, Input, OnInit } from '@angular/core';
import { ControlContainer, UntypedFormGroup } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SignPadDialog } from '../../sign-dialog/sign-dialog.component';
import { LookupStore } from '../../store/lookup.store';
import { ApplicationType, MY_FORMATS } from '../enums-list';
import { FormBase } from '../form-base';

@Component({
  selector: 'app-declaration-information',
  templateUrl: './declaration-information.component.html',
  styleUrls: ['./declaration-information.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ],
  standalone: false
})
export class DeclarationInformationComponent extends FormBase implements OnInit {
  @Input() formType: number;
  public form: UntypedFormGroup;
  protected readonly lookupStore = inject(LookupStore);
  ApplicationType = ApplicationType;
  eligible_name: string;
  get cvapEmail(): string {
    return this.lookupStore.cvapEmail();
  }

  constructor(private controlContainer: ControlContainer, private matDialog: MatDialog) {
    super();
  }

  ngOnInit() {
    this.form = <UntypedFormGroup>this.controlContainer.control;
    setTimeout(() => {
      this.form.markAsTouched();
    }, 0);
    // console.log("declaration info component");
    // console.log(this.form);

    if (this.formType === ApplicationType.Victim_Application) {
      this.eligible_name = 'Victims';
    }
    if (this.formType === ApplicationType.IFM_Application) {
      this.eligible_name = 'Immediate Family Members';
    }
    if (this.formType === ApplicationType.Witness_Application) {
      this.eligible_name = 'Witnesses';
    }
  }

  showSignPad(control): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.matDialog.open(SignPadDialog, dialogConfig);
    dialogRef.afterClosed().subscribe(
      (data) => {
        var patchObject = {};
        patchObject[control] = data;
        this.form.patchValue(patchObject);
      },
      (err) => console.log(err)
    );
  }
}
