import { FormBase } from "../../form-base";
import { OnInit, Component, Input } from "@angular/core";
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatDialog } from "@angular/material";
import { FormGroup, ControlContainer } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS, IOptionSetVal, ResitutionForm, CRMBoolean } from "../../enums-list";
import { iLookupData } from "../../../models/lookup-data.model";
import { POSTAL_CODE } from "../../regex.constants";
import { AddressHelper } from "../../address/address.helper";

@Component({
    selector: 'app-restitution-contact-information',
    templateUrl: './contact-information.component.html',
    styleUrls: ['./contact-information.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})
export class RestitutionContactInformationComponent extends FormBase implements OnInit {
    @Input() formType: IOptionSetVal;
    @Input() lookupData: iLookupData;
    @Input() isDisabled: boolean;
    public form: FormGroup;
    ResitutionForm = ResitutionForm;
    postalRegex = POSTAL_CODE;
    CRMBoolean = CRMBoolean;

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
        this.form = <FormGroup>this.controlContainer.control;
        setTimeout(() => { this.form.markAsTouched(); }, 0);
        console.log("contact info component");
        console.log(this.form);
    }
}