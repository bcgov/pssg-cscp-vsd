import { FormBase } from "../form-base";
import { OnInit, Component, Input } from "@angular/core";
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatDialog } from "@angular/material";
import { FormGroup, ControlContainer } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS, IOptionSetVal, ResitutionForm } from "../enums-list";
import { iLookupData } from "../../models/lookup-data.model";
import { POSTAL_CODE } from "../regex.constants";
import { AddressHelper } from "../address/address.helper";

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
    public form: FormGroup;
    ResitutionForm = ResitutionForm;
    postalRegex = POSTAL_CODE;

    page_header: string = "";
    applicant_type: string = "";

    addressHelper = new AddressHelper();
    phoneMinLength: number = 10;
    phoneMaxLength: number = 15;

    isIE: boolean = false;

    constructor(
        private controlContainer: ControlContainer,
        private matDialog: MatDialog,
    ) {
        super();
    }

    ngOnInit() {
        var ua = window.navigator.userAgent;
        this.isIE = /MSIE|Trident/.test(ua);

        this.form = <FormGroup>this.controlContainer.control;
        setTimeout(() => { this.form.markAsTouched(); }, 0);
        // console.log("overview component");
        // console.log(this.formType);

        if (this.formType.val === ResitutionForm.Victim.val) {
            this.page_header = "Victim Information & Addresses";
            this.applicant_type = "Victim";
        }
        else if (this.formType.val === ResitutionForm.Offender.val) {
            this.page_header = "Restitution Program Offender Application";
            this.applicant_type = "Offender";
        }

    }
}