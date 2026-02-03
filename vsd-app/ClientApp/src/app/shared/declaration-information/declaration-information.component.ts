import { Component, Input, OnInit } from '@angular/core';
import { ControlContainer, UntypedFormGroup } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { iLookupData } from '../../interfaces/lookup-data.interface';
import { LookupService } from '../../services/lookup.service';
import { SignPadDialog } from '../../sign-dialog/sign-dialog.component';
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
  ]
})
export class DeclarationInformationComponent extends FormBase implements OnInit {
  @Input() formType: number;
  @Input() lookupData: iLookupData;
  public form: UntypedFormGroup;
  ApplicationType = ApplicationType;
  eligible_name: string;
  cvapEmail: string = '';

  constructor(
    private controlContainer: ControlContainer,
    private matDialog: MatDialog,
    private lookupService: LookupService
  ) {
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

    if (this.lookupService.cvapEmail) {
      this.cvapEmail = this.lookupService.cvapEmail;
    } else {
      this.lookupService.getCVAPEmails().subscribe((res) => {
        this.cvapEmail = res.cvapEmail;
      });
    }
  }

  showSignPad(control): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.matDialog.open(SignPadDialog, dialogConfig);
    dialogRef.afterClosed().subscribe(
      (data) => {
        debugger;
        var patchObject = {};
        patchObject[control] = data;
        this.form.patchValue(patchObject);
      },
      (err) => console.log(err)
    );
  }
}
