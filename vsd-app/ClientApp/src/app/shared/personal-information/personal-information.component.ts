import { OnInit, Component, Input, OnDestroy } from "@angular/core";
import { FormBase } from "../form-base";
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from "@angular/material";
import { FormGroup, ControlContainer, AbstractControl, Validators } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS, ApplicationType } from "../enums-list";
import { POSTAL_CODE } from "../regex.constants";
import { AddressHelper } from "../address/address.helper";
import { EmailValidator } from "../validators/email.validator";
import { Subscription } from "rxjs";

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
export class PersonalInformationComponent extends FormBase implements OnInit, OnDestroy {
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

    preferredMethodOfContactSubscription: Subscription;
    sinSubscription: Subscription;
    // iHaveOtherNamesSubscription: Subscription;
    addressSubscription: Subscription;
    phoneSubscription: Subscription;
    altPhoneSubscription: Subscription;
    emailSubscription: Subscription;
    confirmEmailSubscription: Subscription;

    get preferredMethodOfContact() { return this.form.get('preferredMethodOfContact'); }

    constructor(
        private controlContainer: ControlContainer,
    ) {
        super();
    }

    ngOnInit() {
        this.form = <FormGroup>this.controlContainer.control;
        setTimeout(() => { this.form.markAsTouched(); }, 0);
        console.log("personal info component");
        console.log(this.form);

        this.header = "Personal";
        if (this.formType === ApplicationType.Victim_Application) {
            this.header = "Victim";
        }

        if (this.formType === ApplicationType.IFM_Application || this.formType === ApplicationType.Witness_Application) {
            this.addressSubscription = this.form.get('primaryAddress').valueChanges.subscribe(value => {
                this.copyPersonalAddressToVictimAddress(this.form.parent);
            });

            this.phoneSubscription = this.form.get('phoneNumber').valueChanges.subscribe(value => {
                this.copyPersonalContactInfoToVictim(this.form.parent);
            });
            this.altPhoneSubscription = this.form.get('alternatePhoneNumber').valueChanges.subscribe(value => {
                this.copyPersonalContactInfoToVictim(this.form.parent);
            });
            this.emailSubscription = this.form.get('email').valueChanges.subscribe(value => {
                this.copyPersonalContactInfoToVictim(this.form.parent);
            });
            this.confirmEmailSubscription = this.form.get('confirmEmail').valueChanges.subscribe(value => {
                this.copyPersonalContactInfoToVictim(this.form.parent);
            });
        }

        this.preferredMethodOfContactSubscription = this.form.get('preferredMethodOfContact').valueChanges.subscribe(value => this.preferredMethodOfContactChange(value));

        if (this.formType === ApplicationType.Victim_Application || this.formType === ApplicationType.IFM_Application) {
            this.sinSubscription = this.form.get('sin').valueChanges.subscribe((value) => {
                if (value === null) value = '';
                let incomeForm = 'employmentIncomeInformation';
                if (this.formType === ApplicationType.IFM_Application)
                    incomeForm = 'expenseInformation';
                this.form.parent.get(incomeForm).get('sin').patchValue(value);
            });
        }

        // this.iHaveOtherNamesSubscription = this.form.get('iHaveOtherNames').valueChanges.subscribe(value => {
        //     let otherFirstNameControl = this.form.get('otherFirstName');
        //     let otherLastNameControl = this.form.get('otherLastName');
        //     let dateOfNameChangeControl = this.form.get('dateOfNameChange');
        //     if (value === true) {
        //         this.setControlValidators(otherFirstNameControl, [Validators.required]);
        //         this.setControlValidators(otherLastNameControl, [Validators.required]);
        //         this.setControlValidators(dateOfNameChangeControl, [Validators.required]);
        //     }
        //     else {
        //         this.clearControlValidators(otherFirstNameControl);
        //         this.clearControlValidators(otherLastNameControl);
        //         this.clearControlValidators(dateOfNameChangeControl);
        //     }
        // });
    }

    ngOnDestroy() {
        this.preferredMethodOfContactSubscription.unsubscribe();
        // this.iHaveOtherNamesSubscription.unsubscribe();
        if (this.formType === ApplicationType.Victim_Application || this.formType === ApplicationType.IFM_Application) {
            if (this.sinSubscription) this.sinSubscription.unsubscribe();
        }

        if (this.formType === ApplicationType.IFM_Application || this.formType === ApplicationType.Witness_Application) {
            if (this.addressSubscription) this.addressSubscription.unsubscribe();
            if (this.phoneSubscription) this.phoneSubscription.unsubscribe();
            if (this.altPhoneSubscription) this.altPhoneSubscription.unsubscribe();
            if (this.emailSubscription) this.emailSubscription.unsubscribe();
            if (this.confirmEmailSubscription) this.confirmEmailSubscription.unsubscribe();
        }
    }

    preferredMethodOfContactChange(value) {
        let phoneControl = this.form.get('phoneNumber');
        let emailControl = this.form.get('email');
        let emailConfirmControl = this.form.get('confirmEmail');
        let agreeToCVAPControl = this.form.get('agreeToCvapCommunicationExchange');

        this.addressHelper.clearAddressValidatorsAndErrors(this.form, 'primaryAddress');
        this.addressHelper.clearAddressValidatorsAndErrors(this.form, 'alternateAddress');
        this.addressHelper.setAddressAsRequired(this.form, 'primaryAddress');
        this.addressHelper.markAsTouched(this.form, 'primaryAddress');

        this.setControlValidators(phoneControl, [Validators.minLength(10), Validators.maxLength(10)]);
        this.setControlValidators(emailControl, [Validators.email]);
        this.setControlValidators(emailConfirmControl, [Validators.email, EmailValidator('email')]);
        this.clearControlValidators(agreeToCVAPControl);

        let contactMethod = parseInt(value);
        if (contactMethod === 2) { //phone call
            this.setControlValidators(phoneControl, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]);
            this.phoneIsRequired = true;
            this.emailIsRequired = false;
            this.addressIsRequired = false;
        } else if (contactMethod === 1) { //Email
            this.setControlValidators(emailControl, [Validators.required, Validators.email]);
            this.setControlValidators(emailConfirmControl, [Validators.required, Validators.email, EmailValidator('email')]);
            this.setControlValidators(agreeToCVAPControl, [Validators.requiredTrue]);
            this.phoneIsRequired = false;
            this.emailIsRequired = true;
            this.addressIsRequired = false;
        } else if (contactMethod === 4) { //Primary Mail
            this.phoneIsRequired = false;
            this.emailIsRequired = false;
            this.addressIsRequired = true;
            this.alternateAddressIsRequired = false;
        } else if (contactMethod === 100000002) { //Alternate Mail
            this.addressHelper.setAddressAsRequired(this.form, 'alternateAddress');
            this.addressHelper.markAsTouched(this.form, 'alternateAddress');
            this.phoneIsRequired = false;
            this.emailIsRequired = false;
            this.addressIsRequired = false;
            this.alternateAddressIsRequired = true;
        }
    }
}