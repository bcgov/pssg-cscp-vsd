import { FormBase } from "../../form-base";
import { OnInit, Component, Input } from "@angular/core";
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from "@angular/material";
import { FormGroup, ControlContainer, Validators } from "@angular/forms";
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

    preferredMethodOfContactChange() {
        let preferredVal = this.form.get("preferredMethodOfContact").value;
        let phoneControl = this.form.get("phoneNumber");
        let emailControl = this.form.get("email");

        if (preferredVal == this.enum.ContactMethods.Phone.val) {
            this.setControlValidators(phoneControl, [Validators.required, Validators.minLength(10), Validators.maxLength(15)]);

            this.setControlValidators(emailControl, [Validators.email]);
        }
        else if (preferredVal == this.enum.ContactMethods.Email.val) {
            this.setControlValidators(emailControl, [Validators.required, Validators.email]);

            this.setControlValidators(phoneControl, [Validators.minLength(10), Validators.maxLength(15)]);
            // this.form.get("smsPreferred").patchValue(null);
        }
        else if (preferredVal == this.enum.ContactMethods.Mail.val) {
            this.setControlValidators(phoneControl, [Validators.minLength(10), Validators.maxLength(15)]);
            this.setControlValidators(emailControl, [Validators.email]);
            // this.form.get("smsPreferred").patchValue(null);
        }
        else {
            this.setControlValidators(phoneControl, [Validators.minLength(10), Validators.maxLength(15)]);
            this.setControlValidators(emailControl, [Validators.email]);
            // this.form.get("smsPreferred").patchValue(null);
        }
    }
}