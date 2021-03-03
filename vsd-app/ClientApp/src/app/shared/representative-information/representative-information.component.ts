import { OnInit, Component, Input, OnDestroy } from "@angular/core";
import { FormBase } from "../form-base";
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from "@angular/material";
import { FormGroup, Validators, FormBuilder, ControlContainer } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS, ApplicationType } from "../enums-list";
import { COUNTRIES_ADDRESS } from "../address/country-list";
import { AddressHelper } from "../address/address.helper";
import { EmailValidator } from "../validators/email.validator";
import { RepresentativeInfoHelper } from "./representative-information.helper";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { iLookupData } from "../../interfaces/lookup-data.interface";
import { LookupService } from "../../services/lookup.service";

@Component({
    selector: 'app-representative-information',
    templateUrl: './representative-information.component.html',
    styleUrls: ['./representative-information.component.scss'],
    providers: [
        // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
        // application's root module. We provide it at the component level here, due to limitations of
        // our example generation script.
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})
export class RepresentativeInformationComponent extends FormBase implements OnInit, OnDestroy {
    @Input() formType: number;
    @Input() lookupData: iLookupData;
    public form: FormGroup;
    ApplicationType = ApplicationType;
    provinceList: string[];
    relationshipList: string[];
    header: string;

    originalOnBehalfOf: number;

    representativeInfoHelper = new RepresentativeInfoHelper();

    representativePhoneIsRequired: boolean = false;
    representativeEmailIsRequired: boolean = false;
    representativeAddressIsRequired: boolean = false;

    addressHelper = new AddressHelper();
    addressInfoSubscription: Subscription;
    contactInfoSubscription: Subscription;

    constructor(
        private controlContainer: ControlContainer,
        private fb: FormBuilder,
        private route: ActivatedRoute,
        public lookupService: LookupService,
    ) {
        super();
        var canada = COUNTRIES_ADDRESS.filter(c => c.name.toLowerCase() == 'canada')[0];
        this.provinceList = canada.areas;
    }

    ngOnInit() {
        this.form = <FormGroup>this.controlContainer.control;
        setTimeout(() => {
            this.form.markAsTouched();
            this.setRequiredFields(this.form.get('completingOnBehalfOf').value);
        }, 0);
        // console.log("representative info component");
        // console.log(this.form);

        if (this.formType === ApplicationType.Victim_Application) {
            this.header = "Victim";
        }
        if (this.formType === ApplicationType.IFM_Application) {
            this.header = "Immediate Family Member";
        }
        if (this.formType === ApplicationType.Witness_Application) {
            this.header = "Witness";
        }

        this.originalOnBehalfOf = parseInt(this.route.snapshot.queryParamMap.get('ob'));

        this.form.get('completingOnBehalfOf').valueChanges.subscribe(value => {
            this.setRequiredFields(value);
        });

        this.form.get('representativePreferredMethodOfContact').valueChanges.subscribe(value => {
            let contactMethod = parseInt(value);
            let completingOnBehalfOf = this.form.get('completingOnBehalfOf').value;
            if (completingOnBehalfOf === 100000002 || completingOnBehalfOf === 100000003) {
                this.setupRepresentativeContactInformation(contactMethod);
            }
        });

        this.addressInfoSubscription = this.form.get('mostRecentMailingAddressSameAsPersonal').valueChanges.subscribe(value => {
            this.copyPersonalAddressToRepresentativeAddress(this.form.parent);
        });

        this.contactInfoSubscription = this.form.get('applicantSameContactInfo').valueChanges.subscribe(value => {
            this.copyPersonalContactInfoToRepresentative(this.form.parent);
        });

        if (this.lookupData.representativeRelationships && this.lookupData.representativeRelationships.length > 0) {
            this.relationshipList = this.lookupData.representativeRelationships.map(r => r.vsd_name);
        }
        else {
            this.lookupService.getRepresentativeRelationships().subscribe((res) => {
                this.lookupData.representativeRelationships = res.value;
                if (this.lookupData.representativeRelationships) {
                    this.lookupData.representativeRelationships.sort(function (a, b) {
                        return a.vsd_name.localeCompare(b.vsd_name);
                    });
                }
                this.relationshipList = this.lookupData.representativeRelationships.map(r => r.vsd_name);
            });
        }
    }

    ngOnDestroy() {
        if (this.addressInfoSubscription) this.addressInfoSubscription.unsubscribe();
        if (this.contactInfoSubscription) this.contactInfoSubscription.unsubscribe();
    }

    setRequiredFields(completingOnBehalfOf: number) {
        let representativeFirstName = this.form.get('representativeFirstName');
        let representativeLastName = this.form.get('representativeLastName');
        let applicantSameContactInfo = this.form.get('applicantSameContactInfo');
        let mostRecentMailingAddressSameAsPersonal = this.form.get('mostRecentMailingAddressSameAsPersonal');
        let representativePreferredMethodOfContact = this.form.get('representativePreferredMethodOfContact');

        this.clearControlValidators(representativeFirstName);
        this.clearControlValidators(representativeLastName);
        this.clearControlValidators(applicantSameContactInfo);
        this.clearControlValidators(mostRecentMailingAddressSameAsPersonal);
        this.clearControlValidators(representativePreferredMethodOfContact);
        this.addressHelper.clearAddressValidatorsAndErrors(this.form, 'representativeAddress');

        let relationshipToPersonControl = this.form.get('relationshipToPerson');
        if (completingOnBehalfOf === 100000003) { //legal rep, fill in relationshipToPerson
            relationshipToPersonControl.patchValue('');
            this.setControlValidators(relationshipToPersonControl, [Validators.required]);
        }
        else if (completingOnBehalfOf === 100000002) {
            relationshipToPersonControl.patchValue('Parent');
            this.clearControlValidators(relationshipToPersonControl);
        }
        else {
            relationshipToPersonControl.patchValue('');
            this.clearControlValidators(relationshipToPersonControl);
        }


        let useValidation = completingOnBehalfOf === 100000002 || completingOnBehalfOf === 100000003;
        if (useValidation) {
            this.setupRepresentativeContactInformation(this.form.get('representativePreferredMethodOfContact').value);  // Have to clear contact validators on contact method change
            this.setControlValidators(representativeFirstName, [Validators.required]);
            this.setControlValidators(representativeLastName, [Validators.required]);
            this.setControlValidators(applicantSameContactInfo, [Validators.required]);
            this.setControlValidators(mostRecentMailingAddressSameAsPersonal, [Validators.required]);
            this.setControlValidators(representativePreferredMethodOfContact, [Validators.required, Validators.min(100000000), Validators.max(100000002)]);
        }
        else {
            let options = { onlySelf: true, emitEvent: false };
            let freshForm = this.representativeInfoHelper.setupFormGroup(this.fb, this.formType);
            freshForm.removeControl('completingOnBehalfOf');
            this.form.patchValue(freshForm.value, options);
        }
    }

    setupRepresentativeContactInformation(contactMethod: number): void {
        let options = { onlySelf: true, emitEvent: false };
        let phoneControl = this.form.get('representativePhoneNumber');
        let emailControl = this.form.get('representativeEmail');
        let emailConfirmControl = this.form.get('representativeConfirmEmail');

        this.addressHelper.clearAddressValidatorsAndErrors(this.form, 'representativeAddress');
        this.addressHelper.setAddressAsRequired(this.form, 'representativeAddress');

        phoneControl.setValidators([Validators.minLength(8), Validators.maxLength(15)]);
        phoneControl.setErrors(null, options);
        emailControl.setValidators([Validators.email]);
        emailControl.setErrors(null, options);
        emailConfirmControl.setValidators([Validators.email, EmailValidator('representativeEmail')]);
        emailConfirmControl.setErrors(null, options);

        if (contactMethod === 100000001) { //Phone Call
            phoneControl.setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(15)]);
            this.representativePhoneIsRequired = true;
            this.representativeEmailIsRequired = false;
        } else if (contactMethod === 100000000) { //Email
            emailControl.setValidators([Validators.required, Validators.email]);
            emailConfirmControl.setValidators([Validators.required, Validators.email, EmailValidator('representativeEmail')]);
            this.representativePhoneIsRequired = false;
            this.representativeEmailIsRequired = true;
        } else if (contactMethod === 100000002) { //Mail
            this.representativePhoneIsRequired = false;
            this.representativeEmailIsRequired = false;
        }

        this.representativeAddressIsRequired = true;

        phoneControl.markAsTouched();
        phoneControl.updateValueAndValidity(options);
        emailControl.markAsTouched();
        emailControl.updateValueAndValidity(options);
        emailConfirmControl.markAsTouched();
        emailConfirmControl.updateValueAndValidity(options);
    }

    setRepresentativePhoneValidators() {
        let phoneMinLength = 10;
        let phoneMaxLength = 15;
        if (this.form.get('representativeAddress.country').value === 'Canada' || this.form.get('representativeAddress.country').value === 'United States of America') {
            phoneMinLength = 10;
        }
        else {
            phoneMinLength = 8;
        }

        let phoneControl = this.form.get('representativePhoneNumber');
        let altPhoneControl = this.form.get('representativeAlternatePhoneNumber');
        this.setControlValidators(phoneControl, [Validators.minLength(phoneMinLength), Validators.maxLength(phoneMaxLength)]);
        this.setControlValidators(altPhoneControl, [Validators.minLength(phoneMinLength), Validators.maxLength(phoneMaxLength)]);
        phoneControl.patchValue(phoneControl.value);
        altPhoneControl.patchValue(altPhoneControl.value);
    }
}