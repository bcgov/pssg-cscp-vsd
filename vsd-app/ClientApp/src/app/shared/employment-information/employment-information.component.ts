import { OnInit, Component, Input, OnDestroy } from "@angular/core";
import { FormBase } from "../form-base";
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatDatepickerInputEvent } from "@angular/material";
import { FormArray, FormGroup, Validators, FormBuilder, ControlContainer, AbstractControl } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS, ApplicationType, CRMBoolean } from "../enums-list";
import * as moment from 'moment';
import { POSTAL_CODE } from "../regex.constants";
import { COUNTRIES_ADDRESS_2 } from "../address/country-list";
import { EmploymentInfoHelper } from "./employment-information.helper";
import { Subscription } from "rxjs";
import { AddressHelper } from "../address/address.helper";
import { iLookupData } from "../../models/lookup-data.model";

@Component({
    selector: 'app-employment-information',
    templateUrl: './employment-information.component.html',
    styleUrls: ['./employment-information.component.scss'],
    providers: [
        // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
        // application's root module. We provide it at the component level here, due to limitations of
        // our example generation script.
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})
export class EmploymentInformationComponent extends FormBase implements OnInit, OnDestroy {
    @Input() formType: number;
    @Input() lookupData: iLookupData;
    public form: FormGroup;

    postalRegex = POSTAL_CODE;

    countryList = COUNTRIES_ADDRESS_2;
    showCurrentlyOffWork: boolean = false;
    today = new Date();
    minEndDate: Date;
    CRMBoolean = CRMBoolean;

    employers: FormArray;

    employmentInfoHelper = new EmploymentInfoHelper();
    addressHelper = new AddressHelper();

    employedAtTimeOfCrimeSubscription: Subscription;
    atWorkAtTimeOfCrimeSubscription: Subscription;
    appliedToWorkSafeBCSubscription: Subscription;
    didMissWorkSubscription: Subscription;
    areYouStillOffWorkSubscription: Subscription;
    loseWagesSubscription: Subscription;
    selfEmployedSubscription: Subscription;
    sinSubscription: Subscription;

    constructor(private controlContainer: ControlContainer,
        private fb: FormBuilder,
    ) {
        super();
    }

    ngOnInit() {
        this.form = <FormGroup>this.controlContainer.control;

        //wrapping this in a timeout fixes "Expression Changed after it was checked" errors... not ideal, but whatever
        setTimeout(() => {
            this.form.markAsTouched();

            if (this.form.parent.get('expenseInformation.haveLostEmploymentIncomeExpenses').value === true) {
                let emplaoyedAtTimeOfCrimeControl = this.form.get('wereYouEmployedAtTimeOfCrime');
                let didYouMissWorkDueToCrimeControl = this.form.get('didYouMissWorkDueToCrime');
                emplaoyedAtTimeOfCrimeControl.setValidators([Validators.required]);
                emplaoyedAtTimeOfCrimeControl.updateValueAndValidity();
                didYouMissWorkDueToCrimeControl.setValidators([Validators.required]);
                didYouMissWorkDueToCrimeControl.updateValueAndValidity();
            }
            else {
                let options = { onlySelf: true, emitEvent: false };
                let emplaoyedAtTimeOfCrimeControl = this.form.get('wereYouEmployedAtTimeOfCrime');
                let didYouMissWorkDueToCrimeControl = this.form.get('didYouMissWorkDueToCrime');

                emplaoyedAtTimeOfCrimeControl.clearValidators();
                emplaoyedAtTimeOfCrimeControl.setErrors(null, options);
                emplaoyedAtTimeOfCrimeControl.updateValueAndValidity(options);
                didYouMissWorkDueToCrimeControl.clearValidators();
                didYouMissWorkDueToCrimeControl.setErrors(null, options);
                didYouMissWorkDueToCrimeControl.updateValueAndValidity(options);
            }

        }, 0);
        console.log("employment info");
        console.log(this.form);

        let endDate = this.form.get('daysWorkMissedEnd').value;
        if (endDate) {
            this.showCurrentlyOffWork = moment(endDate).isSame(new Date(), "day");
        }

        this.employedAtTimeOfCrimeSubscription = this.form.get('wereYouEmployedAtTimeOfCrime').valueChanges.subscribe((value) => {
            let control = this.form.get('wereYouAtWorkAtTimeOfIncident');

            if (value === CRMBoolean.True) {
                this.setControlValidators(control, [Validators.required]);
            }
            else {
                control.patchValue('');
                this.clearControlValidators(control);
            }
        });

        this.atWorkAtTimeOfCrimeSubscription = this.form.get('wereYouAtWorkAtTimeOfIncident').valueChanges.subscribe((value) => {
            let control = this.form.get('haveYouAppliedToWorkSafe');

            if (value === CRMBoolean.True) {
                this.setControlValidators(control, [Validators.required]);
            }
            else {
                control.patchValue('');
                this.clearControlValidators(control);
            }
        });

        this.appliedToWorkSafeBCSubscription = this.form.get('haveYouAppliedToWorkSafe').valueChanges.subscribe((value) => {
            let control = this.form.get('workersCompensationClaimNumber');

            if (value === CRMBoolean.True) {
                this.setControlValidators(control, [Validators.required]);
            }
            else {
                control.patchValue('');
                this.clearControlValidators(control);
            }
        });

        this.didMissWorkSubscription = this.form.get('didYouMissWorkDueToCrime').valueChanges.subscribe((value) => {
            let startDayControl = this.form.get('daysWorkMissedStart');
            let endDayControl = this.form.get('daysWorkMissedEnd');
            let offWorkControl = this.form.get('areYouStillOffWork');
            let loseWageControl = this.form.get('didYouLoseWages');

            if (value === CRMBoolean.True) {
                this.setControlValidators(startDayControl, [Validators.required]);
                this.setControlValidators(offWorkControl, [Validators.required]);
                this.setControlValidators(loseWageControl, [Validators.required]);
                if (this.form.get('areYouStillOffWork').value === CRMBoolean.False) {
                    this.setControlValidators(endDayControl, [Validators.required]);
                }
                else {
                    this.clearControlValidators(endDayControl);
                }
            }
            else {
                startDayControl.patchValue('');
                endDayControl.patchValue('');
                offWorkControl.patchValue('');
                loseWageControl.patchValue('');
                this.clearControlValidators(startDayControl);
                this.clearControlValidators(endDayControl);
                this.clearControlValidators(offWorkControl);
                this.clearControlValidators(loseWageControl);
            }
        });

        this.areYouStillOffWorkSubscription = this.form.get('areYouStillOffWork').valueChanges.subscribe((value) => {
            let endDayControl = this.form.get('daysWorkMissedEnd');

            if (value === CRMBoolean.False) {
                this.setControlValidators(endDayControl, [Validators.required]);
            }
            else {
                endDayControl.patchValue('');
                this.clearControlValidators(endDayControl);
            }
        });

        this.loseWagesSubscription = this.form.get('didYouLoseWages').valueChanges.subscribe((value) => {
            let control = this.form.get('areYouSelfEmployed');
            let sinControl = this.form.get('sin');


            if (value === CRMBoolean.True) {
                // this.removeAllEmployers();
                this.showEmployers();
                this.setControlValidators(control, [Validators.required]);
                this.setControlValidators(sinControl, [Validators.required]);
            }
            else {
                this.removeAllEmployers();
                control.patchValue('');
                this.clearControlValidators(control);
                this.clearControlValidators(sinControl);
            }
        });

        this.sinSubscription = this.form.get('sin').valueChanges.subscribe((value) => {
            if (value === null) value = '';
            this.form.parent.get('personalInformation').get('sin').patchValue(value);
        });

        this.selfEmployedSubscription = this.form.get('areYouSelfEmployed').valueChanges.subscribe((value) => {
            let currentEmployers = this.form.get('employers') as FormArray;

            for (let i = 0; i < currentEmployers.length; ++i) {
                let thisEmployer = currentEmployers.controls[i] as FormGroup;
                let control = thisEmployer.get('contactable');

                if (value === CRMBoolean.True) {
                    // let options = { onlySelf: true, emitEvent: false }
                    control.patchValue(null);
                    this.clearControlValidators(control);
                }
                else {
                    this.setControlValidators(control, [Validators.required]);
                }
            }
        });
    }

    contactableChange(val: boolean, index: number) {
        console.log("contactable change");
        
        let currentEmployers = this.form.get('employers') as FormArray;
        let thisEmployer = currentEmployers.controls[index] as FormGroup;
        // let mayContactEmployer = this.form.get('mayContactEmployer');
        // mayContactEmployer.patchValue(val ? CRMBoolean.True : CRMBoolean.False);

        if (thisEmployer) {
            let nameControl = thisEmployer.get('employerName');
            let emailControl = thisEmployer.get('employerEmail');
            let phoneControl = thisEmployer.get('employerPhoneNumber');
            if (val) {
                this.setControlValidators(nameControl, [Validators.required]);
                // this.setControlValidators(emailControl, [Validators.required, Validators.email]);
                this.setControlValidators(phoneControl, [Validators.required]);
                this.addressHelper.setAddressAsRequired(thisEmployer, 'employerAddress');
            }
            else {
                this.clearControlValidators(nameControl);
                // this.clearControlValidators(emailControl);
                this.clearControlValidators(phoneControl);
                this.addressHelper.clearAddressValidatorsAndErrors(thisEmployer, 'employerAddress');
            }
        }
    }

    ngOnDestroy() {
        if (this.employedAtTimeOfCrimeSubscription) this.employedAtTimeOfCrimeSubscription.unsubscribe();
        if (this.atWorkAtTimeOfCrimeSubscription) this.atWorkAtTimeOfCrimeSubscription.unsubscribe();
        if (this.appliedToWorkSafeBCSubscription) this.appliedToWorkSafeBCSubscription.unsubscribe();
        if (this.didMissWorkSubscription) this.didMissWorkSubscription.unsubscribe();
        if (this.areYouStillOffWorkSubscription) this.areYouStillOffWorkSubscription.unsubscribe();
        if (this.loseWagesSubscription) this.loseWagesSubscription.unsubscribe();
        if (this.sinSubscription) this.sinSubscription.unsubscribe();
        if (this.selfEmployedSubscription) this.selfEmployedSubscription.unsubscribe();
    }

    getCountryProperty(country: string, properyName: string): any {
        if (!country) country = 'Canada';
        if (!properyName) properyName = 'areaType';
        // return 'Province' by default.
        return this.countryList[country][properyName];
    }
    showEmployers() {
        this.employers = this.form.get('employers') as FormArray;
        if (this.employers.length == 0) {
            this.employers.push(this.employmentInfoHelper.createEmployerInfo(this.fb));
        }
    }
    addEmployer() {
        this.employers = this.form.get('employers') as FormArray;
        this.employers.push(this.employmentInfoHelper.createEmployerInfo(this.fb));
    }
    removeEmployer(i: number) {
        this.employers = this.form.get('employers') as FormArray;
        this.employers.removeAt(i);
    }
    removeAllEmployers() {
        this.employers = this.form.get('employers') as FormArray;
        while (this.employers.length !== 0) {
            this.employers.removeAt(0);
        }
    }

    daysWorkMissedStartChange() {
        this.minEndDate = this.form.get('daysWorkMissedStart').value;
        //validate that a selected end date is not before the start date
        let startDate = moment(this.form.get('daysWorkMissedStart').value);

        let endDate = this.form.get('daysWorkMissedEnd').value;
        if (endDate && moment(endDate).isBefore(startDate)) {
            this.form.get('daysWorkMissedEnd').patchValue('');
            this.form.get('daysWorkMissedEnd').updateValueAndValidity();
        }
    }

    daysWorkMissedEndChange() {
        let endDate = moment(this.form.get('daysWorkMissedEnd').value);
        this.showCurrentlyOffWork = endDate.isSame(new Date(), "day");
    }

    setEmployerPhoneValidators(employer: AbstractControl) {
        let phoneMinLength = 10;
        let phoneMaxLength = 15;
        if (employer.get('employerAddress.country').value === 'Canada' || employer.get('employerAddress.country').value === 'United States of America') {
            phoneMinLength = 10;
        }
        else {
            phoneMinLength = 8;
        }

        let phoneControl = employer.get('employerPhoneNumber');
        let faxControl = employer.get('employerFax');
        this.setControlValidators(phoneControl, [Validators.minLength(phoneMinLength), Validators.maxLength(phoneMaxLength)]);
        this.setControlValidators(faxControl, [Validators.minLength(phoneMinLength), Validators.maxLength(phoneMaxLength)]);
        phoneControl.patchValue(phoneControl.value);
        faxControl.patchValue(faxControl.value);
    }
}
