import { FormBase } from "../../form-base";
import { OnInit, Component, Input } from "@angular/core";
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from "@angular/material";
import { FormGroup, ControlContainer } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS, IOptionSetVal, ResitutionForm, CRMBoolean } from "../../enums-list";
import { iLookupData } from "../../../interfaces/lookup-data.interface";

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
    CRMBoolean = CRMBoolean;

    constructor(
        private controlContainer: ControlContainer,
    ) {
        super();
    }

    ngOnInit() {
        this.form = <FormGroup>this.controlContainer.control;
        setTimeout(() => { this.form.markAsTouched(); }, 0);
        // console.log("contact info component");
        // console.log(this.form);
    }
}