import { OnInit, Component, Input } from "@angular/core";
import { FormBase } from "../form-base";
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from "@angular/material";
import { FormGroup, ControlContainer, AbstractControl, Validators } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS, ApplicationType } from "../enums-list";
import { POSTAL_CODE } from "../regex.constants";

@Component({
    selector: 'app-personal-information',
    templateUrl: './personal-information.component.html',
    styleUrls: ['./personal-information.component.scss'],
    providers: [
        // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
        // application's root module. We provide it at the component level here, due to limitations of
        // our example generation script.
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})
export class PersonalInformationComponent extends FormBase implements OnInit {
    @Input() formType: number;
    public form: FormGroup;
    ApplicationType = ApplicationType;
    postalRegex = POSTAL_CODE;

    header: string;

    todaysDate = new Date(); // for the birthdate validation
    oldestHuman = new Date(this.todaysDate.getFullYear() - 120, this.todaysDate.getMonth(), this.todaysDate.getDay());

    phoneIsRequired: boolean = false;
    emailIsRequired: boolean = false;
    addressIsRequired: boolean = false;
    alternateAddressIsRequired: boolean = false;

    get preferredMethodOfContact() { return this.form.get('preferredMethodOfContact'); }

    constructor(
        private controlContainer: ControlContainer,
    ) {
        super();
    }

    ngOnInit() {
        this.form = <FormGroup>this.controlContainer.control;
        console.log("personal info component");
        console.log(this.form);

        this.header = "Personal";
        if (this.formType === ApplicationType.Victim_Application) {
            this.header = "Victim";
        }

        if (this.formType === ApplicationType.IFM_Application || this.formType === ApplicationType.Witness_Application) {
            this.form.get('primaryAddress').valueChanges.subscribe(value => {
                this.copyPersonalAddressToVictimAddress(this.form.parent);
            });
        }


        this.form.get('preferredMethodOfContact').valueChanges.subscribe(value => this.preferredMethodOfContactChange(value));
    }

    preferredMethodOfContactChange(value) {
        let phoneControl = this.form.get('phoneNumber');
        let emailControl = this.form.get('email');
        let emailConfirmControl = this.form.get('confirmEmail');
        let addressControls = [
            this.form.get('primaryAddress.country'),
            this.form.get('primaryAddress.province'),
            this.form.get('primaryAddress.city'),
            this.form.get('primaryAddress.line1'),
        ];

        let altAddressControls = [
            this.form.get('alternateAddress.country'),
            this.form.get('alternateAddress.province'),
            this.form.get('alternateAddress.city'),
            this.form.get('alternateAddress.line1'),
        ];

        let postalControl = this.form.get('primaryAddress.postalCode');
        let altPostalControl = this.form.get('alternateAddress.postalCode');

        phoneControl.clearValidators();
        phoneControl.setErrors(null);
        emailControl.clearValidators();
        emailControl.setErrors(null);
        emailConfirmControl.clearValidators();
        emailConfirmControl.setErrors(null);
        for (let control of addressControls) {
            control.clearValidators();
            control.setErrors(null);
        }
        postalControl.clearValidators();
        postalControl.setErrors(null);

        for (let control of altAddressControls) {
            control.clearValidators();
            control.setErrors(null);

        }
        altPostalControl.clearValidators();
        altPostalControl.setErrors(null);

        let contactMethod = parseInt(value);
        if (contactMethod === 2) {
            phoneControl.setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(10)]);
            this.phoneIsRequired = true;
            this.emailIsRequired = false;
            this.addressIsRequired = false;
            postalControl.setValidators([Validators.pattern(this.postalRegex)]);
            altPostalControl.setValidators([Validators.pattern(this.postalRegex)]);
        } else if (contactMethod === 1) {
            emailControl.setValidators([Validators.required, Validators.email]); // need to add validator to check these two are the same
            emailConfirmControl.setValidators([Validators.required, Validators.email]); // need to add validator to check these two are the same
            this.phoneIsRequired = false;
            this.emailIsRequired = true;
            this.addressIsRequired = false;
            postalControl.setValidators([Validators.pattern(this.postalRegex)]);
            altPostalControl.setValidators([Validators.pattern(this.postalRegex)]);
        } else if (contactMethod === 4) {
            for (let control of addressControls) {
                control.setValidators([Validators.required]);
            }
            postalControl.setValidators([Validators.required, Validators.pattern(this.postalRegex)]);
            altPostalControl.setValidators([Validators.pattern(this.postalRegex)]);
            this.phoneIsRequired = false;
            this.emailIsRequired = false;
            this.addressIsRequired = true;
            this.alternateAddressIsRequired = false;
        }
        else if (contactMethod === 100000002) {
            for (let control of altAddressControls) {
                control.setValidators([Validators.required]);
            }
            postalControl.setValidators([Validators.pattern(this.postalRegex)]);
            altPostalControl.setValidators([Validators.required, Validators.pattern(this.postalRegex)]);
            this.phoneIsRequired = false;
            this.emailIsRequired = false;
            this.addressIsRequired = false;
            this.alternateAddressIsRequired = true;
        }

        phoneControl.markAsTouched();
        phoneControl.updateValueAndValidity();
        emailControl.markAsTouched();
        emailControl.updateValueAndValidity();
        emailConfirmControl.markAsTouched();
        emailConfirmControl.updateValueAndValidity();
        for (let control of addressControls) {
            control.markAsTouched();
            control.updateValueAndValidity();
        }
        for (let control of altAddressControls) {
            control.markAsTouched();
            control.updateValueAndValidity();
        }

        postalControl.markAsTouched();
        postalControl.updateValueAndValidity();

        altPostalControl.markAsTouched();
        altPostalControl.updateValueAndValidity();

    }
}