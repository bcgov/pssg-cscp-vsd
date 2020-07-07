import { OnInit, Component, Input } from "@angular/core";
import { FormBase } from "../form-base";
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from "@angular/material";
import { FormGroup, ControlContainer, AbstractControl, Validators } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS, ApplicationType } from "../enums-list";
import { POSTAL_CODE } from "../regex.constants";
import { AddressHelper } from "../address/address.helper";
import { EmailValidator } from "../validators/email.validator";

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

    addressHelper = new AddressHelper();

    get preferredMethodOfContact() { return this.form.get('preferredMethodOfContact'); }

    constructor(
        private controlContainer: ControlContainer,
    ) {
        super();
    }

    ngOnInit() {
        this.form = <FormGroup>this.controlContainer.control;
        // console.log("personal info component");
        // console.log(this.form);

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

        this.addressHelper.clearAddressValidatorsAndErrors(this.form, 'primaryAddress');
        this.addressHelper.clearAddressValidatorsAndErrors(this.form, 'alternateAddress');
        this.addressHelper.setAddressAsRequired(this.form, 'primaryAddress');
        this.addressHelper.markAsTouched(this.form, 'primaryAddress');

        phoneControl.setValidators([Validators.minLength(10), Validators.maxLength(10)]);
        phoneControl.setErrors(null);
        emailControl.setValidators([Validators.email]);
        emailControl.setErrors(null);
        emailConfirmControl.setValidators([Validators.email, EmailValidator('email')]);
        emailConfirmControl.setErrors(null);

        let contactMethod = parseInt(value);
        if (contactMethod === 2) {
            phoneControl.setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(10)]);
            this.phoneIsRequired = true;
            this.emailIsRequired = false;
            this.addressIsRequired = false;
        } else if (contactMethod === 1) {
            emailControl.setValidators([Validators.required, Validators.email]);
            emailConfirmControl.setValidators([Validators.required, Validators.email, EmailValidator('email')]);
            this.phoneIsRequired = false;
            this.emailIsRequired = true;
            this.addressIsRequired = false;
        } else if (contactMethod === 4) {
            // this.addressHelper.setAddressAsRequired(this.form, 'primaryAddress');

            this.phoneIsRequired = false;
            this.emailIsRequired = false;
            this.addressIsRequired = true;
            this.alternateAddressIsRequired = false;
        }
        else if (contactMethod === 100000002) {
            this.addressHelper.setAddressAsRequired(this.form, 'alternateAddress');
            this.addressHelper.markAsTouched(this.form, 'alternateAddress');

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

    }
}