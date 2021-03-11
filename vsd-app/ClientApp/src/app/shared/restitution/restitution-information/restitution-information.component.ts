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
import { LookupService } from "../../../services/lookup.service";

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

    relationshipList: any = [];

    restitutionInfoHelper = new RestitutionInfoHelper();

    constructor(
        private controlContainer: ControlContainer,
        private fb: FormBuilder,
        private matDialog: MatDialog,
        public lookupService: LookupService,
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

        // if (this.lookupData.relationships && this.lookupData.relationships.length > 0) {
        //     this.relationshipList = this.lookupData.relationships.map(r => r.vsd_name);
        // }
        // else {
        //     this.lookupService.getRestitutionRelationships().subscribe((res) => {
        //         this.lookupData.relationships = res.value;
        //         if (this.lookupData.relationships) {
        //             this.lookupData.relationships.sort(function (a, b) {
        //                 return a.vsd_name.localeCompare(b.vsd_name);
        //             });
        //         }
        //         this.relationshipList = this.lookupData.relationships.map(r => r.vsd_name);
        //     });
        // }

        console.log("TODO - realtionship list should be loaded dynamically from COAST");
        this.relationshipList = ["Family relationship", "Other intimate relationship", "Acquaintance", "Criminal relationship", "Stranger", "Unknown"];
    }

    iHaveOtherNamesChange(val: boolean) {
        if (!val) {
            let otherFirstNameControl = this.form.get('otherFirstName');
            let otherLastNameControl = this.form.get('otherLastName');

            otherFirstNameControl.patchValue('');
            otherLastNameControl.patchValue('');
        }
    }

    authorizeDesignateChange() {
        if (this.form.get("authorizeDesignate").value === CRMBoolean.True) {
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
        courtFiles.push(this.restitutionInfoHelper.createCourtFile(this.fb, this.formType));
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