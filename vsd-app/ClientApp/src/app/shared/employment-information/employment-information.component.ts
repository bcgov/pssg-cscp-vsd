import { OnInit, Component, Input, OnDestroy } from "@angular/core";
import { FormBase } from "../form-base";
import { MatDialogConfig, MatDialog, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatDatepickerInputEvent } from "@angular/material";
import { FormArray, FormGroup, Validators, FormBuilder, ControlContainer } from "@angular/forms";
import { FileBundle } from "../../models/file-bundle";
import { SignPadDialog } from "../../sign-dialog/sign-dialog.component";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS, ApplicationType, CRMBoolean } from "../enums-list";
import * as moment from 'moment';
import { config } from '../../../config';
import { POSTAL_CODE } from "../regex.constants";
import { COUNTRIES_ADDRESS_2 } from "../address/country-list";
import { EmploymentInfoHelper } from "./employment-information.helper";
import { Subscription } from "rxjs";

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
    public form: FormGroup;

    postalRegex = POSTAL_CODE;

    countryList = COUNTRIES_ADDRESS_2;
    showCurrentlyOffWork: boolean = false;
    today = new Date();
    minEndDate: Date;
    CRMBoolean = CRMBoolean;

    employers: FormArray;

    employmentInfoHelper = new EmploymentInfoHelper();

    employedAtTimeOfCrimeSubscription: Subscription;
    atWorkAtTimeOfCrimeSubscription: Subscription;
    appliedToWorkSafeBCSubscription: Subscription;
    didMissWorkSubscription: Subscription;
    loseWagesSubscription: Subscription;
    selfEmployedSubscription: Subscription;

    constructor(private controlContainer: ControlContainer,
        private fb: FormBuilder,
    ) {
        super();
    }

    ngOnInit() {
        this.form = <FormGroup>this.controlContainer.control;
        console.log("employment info");
        console.log(this.form);


        this.employedAtTimeOfCrimeSubscription = this.form.get('wereYouEmployedAtTimeOfCrime').valueChanges.subscribe((value) => {
            let options = { onlySelf: true, emitEvent: false };
            let control = this.form.get('wereYouAtWorkAtTimeOfIncident');

            if (value === CRMBoolean.True) {
                control.setValidators([Validators.required]);
                control.updateValueAndValidity();
            }
            else {
                control.clearValidators();
                control.setErrors(null, options);
                control.updateValueAndValidity(options);
            }
        });

        this.atWorkAtTimeOfCrimeSubscription = this.form.get('wereYouAtWorkAtTimeOfIncident').valueChanges.subscribe((value) => {
            let options = { onlySelf: true, emitEvent: false };
            let control = this.form.get('haveYouAppliedToWorkSafe');

            if (value === CRMBoolean.True) {
                control.setValidators([Validators.required]);
                control.updateValueAndValidity();
            }
            else {
                control.clearValidators();
                control.setErrors(null, options);
                control.updateValueAndValidity(options);
            }
        });

        this.appliedToWorkSafeBCSubscription = this.form.get('haveYouAppliedToWorkSafe').valueChanges.subscribe((value) => {
            let options = { onlySelf: true, emitEvent: false };
            let control = this.form.get('workersCompensationClaimNumber');

            if (value === CRMBoolean.True) {
                control.setValidators([Validators.required]);
                control.updateValueAndValidity();
            }
            else {
                control.clearValidators();
                control.setErrors(null, options);
                control.updateValueAndValidity(options);
            }
        });

        this.didMissWorkSubscription = this.form.get('didYouMissWorkDueToCrime').valueChanges.subscribe((value) => {
            let options = { onlySelf: true, emitEvent: false };
            let startDayControl = this.form.get('daysWorkMissedStart');
            let endDayControl = this.form.get('daysWorkMissedEnd');
            let loseWageControl = this.form.get('didYouLoseWages');

            if (value === CRMBoolean.True) {
                startDayControl.setValidators([Validators.required]);
                startDayControl.updateValueAndValidity();

                endDayControl.setValidators([Validators.required]);
                endDayControl.updateValueAndValidity();

                loseWageControl.setValidators([Validators.required]);
                loseWageControl.updateValueAndValidity();
            }
            else {
                startDayControl.clearValidators();
                startDayControl.setErrors(null, options);
                startDayControl.updateValueAndValidity(options);

                endDayControl.clearValidators();
                startDayControl.setErrors(null, options);
                endDayControl.updateValueAndValidity(options);

                loseWageControl.clearValidators();
                loseWageControl.setErrors(null, options);
                loseWageControl.updateValueAndValidity(options);
            }
        });

        this.loseWagesSubscription = this.form.get('didYouLoseWages').valueChanges.subscribe((value) => {
            let options = { onlySelf: true, emitEvent: false };
            let control = this.form.get('areYouSelfEmployed');


            if (value === CRMBoolean.True) {
                this.addEmployer();
                control.setValidators([Validators.required]);
                control.updateValueAndValidity();
            }
            else {
                this.removeAllEmployers();
                control.clearValidators();
                control.setErrors(null, options);
                control.updateValueAndValidity(options);
            }
        });

        this.selfEmployedSubscription = this.form.get('areYouSelfEmployed').valueChanges.subscribe((value) => {
            let options = { onlySelf: true, emitEvent: false };
            let currentEmployers = this.form.get('employers') as FormArray;
            console.log(currentEmployers);

            for (let i = 0; i < currentEmployers.length; ++i) {
                let thisEmployer = currentEmployers.controls[i] as FormGroup;
                let control = thisEmployer.get('contactable');

                if (value === CRMBoolean.True) {
                    control.clearValidators();
                    control.setErrors(null, options);
                    control.updateValueAndValidity(options);
                }
                else {
                    control.setValidators([Validators.required]);
                    control.updateValueAndValidity();
                }
            }
        });
    }

    ngOnDestroy() {
        this.employedAtTimeOfCrimeSubscription.unsubscribe();
        this.atWorkAtTimeOfCrimeSubscription.unsubscribe();
        this.appliedToWorkSafeBCSubscription.unsubscribe();
        this.didMissWorkSubscription.unsubscribe();
        this.loseWagesSubscription.unsubscribe();
        this.selfEmployedSubscription.unsubscribe();
    }

    getCountryProperty(country: string, properyName: string): any {
        if (!country) country = 'Canada';
        if (!properyName) properyName = 'areaType';
        // return 'Province' by default.
        return this.countryList[country][properyName];
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

    daysWorkMissedStartChange(event: MatDatepickerInputEvent<Date>) {
        this.minEndDate = event.target.value;
        //validate that a selected end date is not before the start date
        let startDate = moment(event.target.value);

        let endDate = this.form.get('daysWorkMissedEnd').value;
        if (endDate && moment(endDate).isBefore(startDate)) {
            this.form.get('daysWorkMissedEnd').patchValue(null);
        }
    }

    daysWorkMissedEndChange(event: MatDatepickerInputEvent<Date>) {
        let endDate = moment(event.target.value);
        this.showCurrentlyOffWork = endDate.isSame(new Date(), "day");
        if (!this.showCurrentlyOffWork) {
            this.form.get('areYouStillOffWork').patchValue(null);
        }
    }
}
