import { FormBase } from "../../form-base";
import { OnInit, Component, Input } from "@angular/core";
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatDialog, MatDialogConfig } from "@angular/material";
import { FormGroup, ControlContainer, FormArray, FormBuilder } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS, IOptionSetVal, ResitutionForm, CRMBoolean } from "../../enums-list";
import { iLookupData } from "../../../interfaces/lookup-data.interface";
import { POSTAL_CODE } from "../../regex.constants";
import { AddressHelper } from "../../address/address.helper";
import { RestitutionInfoHelper } from "./restitution-information.helper";
import { SignPadDialog } from "../../../sign-dialog/sign-dialog.component";

@Component({
    selector: 'app-restitution-information',
    templateUrl: './restitution-information.component.html',
    styleUrls: ['./restitution-information.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})
export class RestitutionInformationComponent extends FormBase implements OnInit {
    @Input() formType: IOptionSetVal;
    @Input() lookupData: iLookupData;
    @Input() isDisabled: boolean;
    public form: FormGroup;
    ResitutionForm = ResitutionForm;
    postalRegex = POSTAL_CODE;
    CRMBoolean = CRMBoolean;

    page_header: string = "";
    applicant_type: string = "";

    addressHelper = new AddressHelper();
    phoneMinLength: number = 10;
    phoneMaxLength: number = 15;

    restitutionInfoHelper = new RestitutionInfoHelper();

    constructor(
        private controlContainer: ControlContainer,
        private fb: FormBuilder,
        private matDialog: MatDialog,
    ) {
        super();
    }

    ngOnInit() {
        this.form = <FormGroup>this.controlContainer.control;
        setTimeout(() => { this.form.markAsTouched(); }, 0);
        // console.log("restitution info component");
        // console.log(this.form);

        if (this.formType.val === ResitutionForm.Victim.val) {
            this.page_header = "Victim Information & Addresses";
            this.applicant_type = "Victim";
        }
        else if (this.formType.val === ResitutionForm.Offender.val) {
            this.page_header = "Restitution Program Offender Application";
            this.applicant_type = "Offender";
        }
    }

    authorizeDesignateChange() {
        if (this.form.get("authoriseVictimDesignate").value === CRMBoolean.True) {
            this.addDesignate();
        }
        else {
            this.removeDesignate();
        }
    }

    addDesignate() {
        let designate = this.form.get('designate') as FormArray;
        if (designate.length == 0) {
            designate.push(this.restitutionInfoHelper.createDesignate(this.fb));
        }
    }

    removeDesignate() {
        let designate = this.form.get('designate') as FormArray;
        while (designate.length > 0) {
            designate.removeAt(0);
        }
    }

    addCourtFile() {
        let courtFiles = this.form.get('courtFiles') as FormArray;
        courtFiles.push(this.restitutionInfoHelper.createCourtFile(this.fb));
    }

    removeCourtFile(index: number) {
        let courtFiles = this.form.get('courtFiles') as FormArray;
        courtFiles.removeAt(index);
    }

    showSignPad(control): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;

        const dialogRef = this.matDialog.open(SignPadDialog, dialogConfig);
        dialogRef.afterClosed().subscribe(
            data => {
                var patchObject = {};
                patchObject[control] = data;
                this.form.patchValue(
                    patchObject
                );
            },
            err => console.log(err)
        );
    }
}