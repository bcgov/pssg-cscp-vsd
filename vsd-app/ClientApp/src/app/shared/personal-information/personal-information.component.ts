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
import { iLookupData } from "../../interfaces/lookup-data.interface";

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
    @Input() lookupData: iLookupData;
    public form: FormGroup;
    ApplicationType = ApplicationType;
    postalRegex = POSTAL_CODE;

    header: string;

    todaysDate = new Date(); // for the birthdate validation
    oldestHuman = new Date(this.todaysDate.getFullYear() - 120, this.todaysDate.getMonth(), this.todaysDate.getDay());

    phoneIsRequired: boolean = false;
    isVoiceMailRequired: boolean = false;
    emailIsRequired: boolean = false;
    addressIsRequired: boolean = false;
    alternateAddressIsRequired: boolean = false;

    addressHelper = new AddressHelper();

    preferredMethodOfContactSubscription: Subscription;
    sinSubscription: Subscription;
    leaveVoicemailSubscription: Subscription;
    addressSubscription: Subscription;
    phoneSubscription: Subscription;
    altPhoneSubscription: Subscription;
    emailSubscription: Subscription;
    confirmEmailSubscription: Subscription;

    phoneMinLength: number = 10;
    phoneMaxLength: number = 15;

    get preferredMethodOfContact() { return this.form.get('preferredMethodOfContact'); }
    get leaveVoicemail() { return this.form.get('leaveVoicemail'); }

    constructor(
        private controlContainer: ControlContainer,
    ) {
        super();
    }

    ngOnInit() {
        this.form = <FormGroup>this.controlContainer.control;
        setTimeout(() => { this.form.markAsTouched(); }, 0);
        // console.log("personal info component");
        // console.log(this.form);

        this.header = "Personal";
        if (this.formType === ApplicationType.Victim_Application) {
            this.header = "Victim";
        }

        if (this.formType === ApplicationType.Victim_Application) {
            this.addressSubscription = this.form.get('primaryAddress').valueChanges.subscribe(value => {
                this.copyPersonalAddressToRepresentativeAddress(this.form.parent);
                this.setPhoneValidators();
            });

            this.phoneSubscription = this.form.get('phoneNumber').valueChanges.subscribe(value => {
                this.copyPersonalContactInfoToRepresentative(this.form.parent);
            });
            this.altPhoneSubscription = this.form.get('alternatePhoneNumber').valueChanges.subscribe(value => {
                this.copyPersonalContactInfoToRepresentative(this.form.parent);
            });
            this.emailSubscription = this.form.get('email').valueChanges.subscribe(value => {
                this.copyPersonalContactInfoToRepresentative(this.form.parent);
            });
            this.confirmEmailSubscription = this.form.get('confirmEmail').valueChanges.subscribe(value => {
                this.copyPersonalContactInfoToRepresentative(this.form.parent);
            });
        }

        if (this.formType === ApplicationType.IFM_Application || this.formType === ApplicationType.Witness_Application) {
            this.addressSubscription = this.form.get('primaryAddress').valueChanges.subscribe(value => {
                this.copyPersonalAddressToVictimAddress(this.form.parent);
                this.copyPersonalAddressToRepresentativeAddress(this.form.parent);
                this.setPhoneValidators();
            });

            this.phoneSubscription = this.form.get('phoneNumber').valueChanges.subscribe(value => {
                this.copyPersonalContactInfoToVictim(this.form.parent);
                this.copyPersonalContactInfoToRepresentative(this.form.parent);
            });
            this.altPhoneSubscription = this.form.get('alternatePhoneNumber').valueChanges.subscribe(value => {
                this.copyPersonalContactInfoToVictim(this.form.parent);
                this.copyPersonalContactInfoToRepresentative(this.form.parent);
            });
            this.emailSubscription = this.form.get('email').valueChanges.subscribe(value => {
                this.copyPersonalContactInfoToVictim(this.form.parent);
                this.copyPersonalContactInfoToRepresentative(this.form.parent);
            });
            this.confirmEmailSubscription = this.form.get('confirmEmail').valueChanges.subscribe(value => {
                this.copyPersonalContactInfoToVictim(this.form.parent);
                this.copyPersonalContactInfoToRepresentative(this.form.parent);
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

        this.leaveVoicemailSubscription = this.form.get('leaveVoicemail').valueChanges.subscribe(value => {
            let phoneControl = this.form.get('phoneNumber');
            let altPhoneControl = this.form.get('alternatePhoneNumber');
            //setup phone control validators based on preferredMethodOfContact
            this.setControlValidators(phoneControl, [Validators.minLength(this.phoneMinLength), Validators.maxLength(this.phoneMaxLength)]);
            this.setControlValidators(altPhoneControl, [Validators.minLength(this.phoneMinLength), Validators.maxLength(this.phoneMaxLength)]);
            let contactMethod = this.form.get('preferredMethodOfContact').value;
            if (contactMethod === 2) { //phone call
                this.setControlValidators(phoneControl, [Validators.required, Validators.minLength(this.phoneMinLength), Validators.maxLength(this.phoneMaxLength)]);
            }
            //then update potentially update it based on voicemail selection

            let voicemailOption = parseInt(value);
            if (voicemailOption === 100000000) { //Primary and Alternate
                this.setControlValidators(phoneControl, [Validators.required, Validators.minLength(this.phoneMinLength), Validators.maxLength(this.phoneMaxLength)]);
                this.setControlValidators(altPhoneControl, [Validators.required, Validators.minLength(this.phoneMinLength), Validators.maxLength(this.phoneMaxLength)]);
            }
            else if (voicemailOption === 100000001) { //Primary only
                this.setControlValidators(phoneControl, [Validators.required, Validators.minLength(this.phoneMinLength), Validators.maxLength(this.phoneMaxLength)]);
            }
            else if (voicemailOption === 100000002) { //Alternate only
                this.setControlValidators(altPhoneControl, [Validators.required, Validators.minLength(this.phoneMinLength), Validators.maxLength(this.phoneMaxLength)]);
            }
        });
    }

    ngOnDestroy() {
        if (this.preferredMethodOfContactSubscription) this.preferredMethodOfContactSubscription.unsubscribe();
        if (this.leaveVoicemailSubscription) this.leaveVoicemailSubscription.unsubscribe();
        if (this.sinSubscription) this.sinSubscription.unsubscribe();
        if (this.addressSubscription) this.addressSubscription.unsubscribe();
        if (this.phoneSubscription) this.phoneSubscription.unsubscribe();
        if (this.altPhoneSubscription) this.altPhoneSubscription.unsubscribe();
        if (this.emailSubscription) this.emailSubscription.unsubscribe();
        if (this.confirmEmailSubscription) this.confirmEmailSubscription.unsubscribe();
    }

    preferredMethodOfContactChange(value) {
        let phoneControl = this.form.get('phoneNumber');
        let altPhoneControl = this.form.get('alternatePhoneNumber');
        let emailControl = this.form.get('email');
        let emailConfirmControl = this.form.get('confirmEmail');
        let agreeToCVAPEmailControl = this.form.get('agreeToCvapCommunicationExchange');

        this.addressHelper.clearAddressValidatorsAndErrors(this.form, 'primaryAddress');
        this.addressHelper.clearAddressValidatorsAndErrors(this.form, 'alternateAddress');
        this.addressHelper.setAddressAsRequired(this.form, 'primaryAddress');
        // this.addressHelper.markAsTouched(this.form, 'primaryAddress');

        this.setControlValidators(phoneControl, [Validators.minLength(this.phoneMinLength), Validators.maxLength(this.phoneMaxLength)]);
        this.setControlValidators(emailControl, [Validators.email]);
        this.setControlValidators(emailConfirmControl, [Validators.email, EmailValidator('email')]);
        this.clearControlValidators(agreeToCVAPEmailControl);

        let contactMethod = parseInt(value);
        if (contactMethod === 2) { //phone call
            this.setControlValidators(phoneControl, [Validators.required, Validators.minLength(this.phoneMinLength), Validators.maxLength(this.phoneMaxLength)]);
            this.phoneIsRequired = true;
            this.emailIsRequired = false;
            this.addressIsRequired = false;
        } else if (contactMethod === 1) { //Email
            this.setControlValidators(emailControl, [Validators.required, Validators.email]);
            this.setControlValidators(emailConfirmControl, [Validators.required, Validators.email, EmailValidator('email')]);
            this.setControlValidators(agreeToCVAPEmailControl, [Validators.requiredTrue]);
            this.phoneIsRequired = false;
            this.emailIsRequired = true;
            this.addressIsRequired = false;
        } else if (contactMethod === 4) { //Mail
            this.phoneIsRequired = false;
            this.emailIsRequired = false;
            this.addressIsRequired = true;
            this.alternateAddressIsRequired = false;
        }

        let voicemailOption = parseInt(this.form.get('leaveVoicemail').value);
        if (voicemailOption === 100000000) { //Primary and Alternate
            this.setControlValidators(phoneControl, [Validators.required, Validators.minLength(this.phoneMinLength), Validators.maxLength(this.phoneMaxLength)]);
            this.setControlValidators(altPhoneControl, [Validators.required, Validators.minLength(this.phoneMinLength), Validators.maxLength(this.phoneMaxLength)]);
        }
        else if (voicemailOption === 100000001) { //Primary only
            this.setControlValidators(phoneControl, [Validators.required, Validators.minLength(this.phoneMinLength), Validators.maxLength(this.phoneMaxLength)]);
        }
        else if (voicemailOption === 100000002) { //Alternate only
            this.setControlValidators(altPhoneControl, [Validators.required, Validators.minLength(this.phoneMinLength), Validators.maxLength(this.phoneMaxLength)]);
        }

        if (agreeToCVAPEmailControl.value === true) {
            this.setControlValidators(emailControl, [Validators.required, Validators.email]);
            this.setControlValidators(emailConfirmControl, [Validators.required, Validators.email, EmailValidator('email')]);
        }
    }

    iHaveOtherNamesChange(val: boolean) {
        if (!val) {
            let otherFirstNameControl = this.form.get('otherFirstName');
            let otherLastNameControl = this.form.get('otherLastName');
            let dateOfNameChangeControl = this.form.get('dateOfNameChange');

            otherFirstNameControl.patchValue('');
            otherLastNameControl.patchValue('');
            dateOfNameChangeControl.patchValue('');
        }
    }

    setPhoneValidators() {
        if (this.form.get('primaryAddress.country').value === 'Canada' || this.form.get('primaryAddress.country').value === 'United States of America') {
            this.phoneMinLength = 10;
        }
        else {
            this.phoneMinLength = 8;
        }

        // let contactMethod = this.form.get('preferredMethodOfContact').value;
        let phoneControl = this.form.get('phoneNumber');
        let altPhoneControl = this.form.get('alternatePhoneNumber');
        //setup phone control validators based on preferredMethodOfContact
        this.setControlValidators(phoneControl, [Validators.minLength(this.phoneMinLength), Validators.maxLength(this.phoneMaxLength)]);
        this.setControlValidators(altPhoneControl, [Validators.minLength(this.phoneMinLength), Validators.maxLength(this.phoneMaxLength)]);
        let contactMethod = this.form.get('preferredMethodOfContact').value;
        if (contactMethod === 2) { //phone call
            this.setControlValidators(phoneControl, [Validators.required, Validators.minLength(this.phoneMinLength), Validators.maxLength(this.phoneMaxLength)]);
        }
        //then update potentially update it based on voicemail selection
        let voicemailVal = this.form.get('leaveVoicemail').value;
        let voicemailOption = parseInt(voicemailVal);
        if (voicemailOption === 100000000) { //Primary and Alternate
            this.setControlValidators(phoneControl, [Validators.required, Validators.minLength(this.phoneMinLength), Validators.maxLength(this.phoneMaxLength)]);
            this.setControlValidators(altPhoneControl, [Validators.required, Validators.minLength(this.phoneMinLength), Validators.maxLength(this.phoneMaxLength)]);
        }
        else if (voicemailOption === 100000001) { //Primary only
            this.setControlValidators(phoneControl, [Validators.required, Validators.minLength(this.phoneMinLength), Validators.maxLength(this.phoneMaxLength)]);
        }
        else if (voicemailOption === 100000002) { //Alternate only
            this.setControlValidators(altPhoneControl, [Validators.required, Validators.minLength(this.phoneMinLength), Validators.maxLength(this.phoneMaxLength)]);
        }

        phoneControl.patchValue(phoneControl.value);
        altPhoneControl.patchValue(altPhoneControl.value);
    }

    setVoicemailValidators() {
        let phoneVal = this.form.get('phoneNumber').value;
        let altPhoneVal = this.form.get('alternatePhoneNumber').value;
        let voicemailControl = this.form.get('leaveVoicemail');
        let options = { onlySelf: true, emitEvent: false };
        if (phoneVal || altPhoneVal) {
            this.isVoiceMailRequired = true;
            this.setControlValidators(voicemailControl, [Validators.required, Validators.min(1), Validators.max(100000003)], options);
        }
        else {
            this.isVoiceMailRequired = false;
            this.clearControlValidators(voicemailControl, options);
        }
    }

    doNotLiveAtAddressChange(val: boolean) {
        if (!val) {
            this.form.get('mailRecipient').patchValue('');
        }
    }

    canEmailChange(val: boolean) {
        this.preferredMethodOfContactChange(this.form.get('preferredMethodOfContact').value);
    }
}