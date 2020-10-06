import { OnInit, Component, Input, OnDestroy } from "@angular/core";
import { FormBase } from "../form-base";
import { MatDialog, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from "@angular/material";
import { FormArray, FormGroup, Validators, FormBuilder, ControlContainer, FormControl, AbstractControl } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS, ApplicationType } from "../enums-list";
import { COUNTRIES_ADDRESS } from "../address/country-list";
import { HOSPITALS } from "../hospital-list";
import { POSTAL_CODE } from "../regex.constants";
import { AddressHelper } from "../address/address.helper";
import { iLookupData } from "../../models/lookup-data.model";
import { Subscription } from "rxjs";

@Component({
    selector: 'app-medical-information',
    templateUrl: './medical-information.component.html',
    styleUrls: ['./medical-information.component.scss'],
    providers: [
        // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
        // application's root module. We provide it at the component level here, due to limitations of
        // our example generation script.
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})
export class MedicalInformationComponent extends FormBase implements OnInit, OnDestroy {
    @Input() formType: number;
    @Input() lookupData: iLookupData;
    public form: FormGroup;
    ApplicationType = ApplicationType;

    familyDoctorClinicItem: FormControl;

    otherTreatmentItems: FormArray;
    showAddProvider: boolean = true;
    showRemoveProvider: boolean = false;

    provinceList: string[] = [];
    hospitalList = HOSPITALS;
    postalRegex = POSTAL_CODE;

    today = new Date();

    otherTreatmentLabel: string = "";

    addressHelper = new AddressHelper();

    phoneMinLength: number = 10;
    phoneMaxLength: number = 15;

    doctorAddressSubscription: Subscription;
    wereYouTreatedAtHospitalSubscription: Subscription;
    treatedOutsideBcSubscription: Subscription;

    constructor(
        private controlContainer: ControlContainer,
        private matDialog: MatDialog,
        private fb: FormBuilder,
    ) {
        super();
    }

    ngOnInit() {
        this.form = <FormGroup>this.controlContainer.control;
        setTimeout(() => { this.form.markAsTouched(); }, 0);
        console.log("medical info component");
        console.log(this.form);

        if (this.formType === ApplicationType.Victim_Application) {
            this.otherTreatmentLabel = "Have you seen any other doctors, specialists, or counsellors who have been treating you for injuries resulting from the incident?";
        }
        else {
            this.otherTreatmentLabel = "Do you have a counsellor/therapist who has been treating you as a result of the incident?";
        }

        if (this.formType === ApplicationType.Victim_Application) {
            this.form.get('wereYouTreatedAtHospital').valueChanges.subscribe(value => {
                let hospitalControl = this.form.get('treatedAtHospitalName');
                let options = { onlySelf: true, emitEvent: false };

                // hospitalControl.clearValidators();
                // hospitalControl.setErrors(null);

                let useValidation = value === true;
                if (useValidation) {
                    this.setControlValidators(hospitalControl, [Validators.required]);
                    // hospitalControl.setValidators();
                }
                else {
                    this.clearControlValidators(hospitalControl);
                    hospitalControl.patchValue('');

                    let treatedOutsideBCControl = this.form.get('treatedOutsideBc');
                    treatedOutsideBCControl.patchValue(false, options);

                    let outsideBCHospitalControl = this.form.get('treatedOutsideBcHospitalName');
                    outsideBCHospitalControl.clearValidators();
                    outsideBCHospitalControl.setErrors(null);
                    outsideBCHospitalControl.patchValue('');

                    let treatedAtHospitalDateControl = this.form.get('treatedAtHospitalDate');
                    treatedAtHospitalDateControl.patchValue('');
                }

                // hospitalControl.updateValueAndValidity();
            });

            this.form.get('treatedOutsideBc').valueChanges.subscribe(value => {
                let hospitalControl = this.form.get('treatedAtHospitalName');
                let outsideBCHospitalControl = this.form.get('treatedOutsideBcHospitalName');

                if (value === true) {
                    this.clearControlValidators(hospitalControl);
                    outsideBCHospitalControl.setValidators([Validators.required]);
                    // hospitalControl.clearValidators();
                    hospitalControl.setErrors(null);
                    hospitalControl.patchValue('');
                }
                else {
                    this.setControlValidators(hospitalControl, [Validators.required]);
                    // hospitalControl.setValidators([Validators.required]);
                    outsideBCHospitalControl.clearValidators();
                    outsideBCHospitalControl.setErrors(null);
                }
                hospitalControl.updateValueAndValidity();
                outsideBCHospitalControl.updateValueAndValidity();

            });
        }

        this.doctorAddressSubscription = this.form.get('familyDoctorAddress').valueChanges.subscribe(value => {
            this.setDoctorPhoneValidators();
        });

        this.provinceList = this.lookupData.provinces.map(p => p.vsd_name);
    }

    ngOnDestroy() {
        if (this.doctorAddressSubscription) this.doctorAddressSubscription.unsubscribe();
        if (this.wereYouTreatedAtHospitalSubscription) this.wereYouTreatedAtHospitalSubscription.unsubscribe();
        if (this.treatedOutsideBcSubscription) this.treatedOutsideBcSubscription.unsubscribe();
    }

    addProvider(): void {
        // add a medical treatment provider to the list
        this.otherTreatmentItems = this.form.get('otherTreatments') as FormArray;
        let thisTreatment = this.createTreatmentItem();
        this.otherTreatmentItems.push(thisTreatment);
        this.showAddProvider = this.otherTreatmentItems.length < 5;
        this.showRemoveProvider = this.otherTreatmentItems.length > 1;
    }
    clearProviders(): void {
        // remove all providers
        this.otherTreatmentItems = this.form.get('otherTreatments') as FormArray;
        while (this.otherTreatmentItems.length > 0) {
            this.otherTreatmentItems.removeAt(this.otherTreatmentItems.length - 1);
        }
    }

    removeProvider(index: number): void {
        // when the user clicks to remove the medical provider this removes the provider at the index clicked
        this.otherTreatmentItems = this.form.get('otherTreatments') as FormArray;
        this.otherTreatmentItems.removeAt(index);
        this.showAddProvider = this.otherTreatmentItems.length < 5;
        this.showRemoveProvider = this.otherTreatmentItems.length > 1;
    }

    createTreatmentItem(): FormGroup {
        let group = {
            providerCompany: ['', Validators.required],
            providerEmail: ['', [Validators.email]],
            providerFirstName: [''],
            providerLastName: [''],
            providerPhoneNumber: [''],
            providerFax: [''],
            // providerAddress: [''],
            providerAddress: this.fb.group({
                line1: [''],
                line2: [''],
                city: [''],
                postalCode: ['', [Validators.pattern(this.postalRegex)]],
                province: [{ value: 'British Columbia', disabled: false }],
                country: [{ value: 'Canada', disabled: false }],
            }),
        };

        if (this.formType === ApplicationType.Victim_Application) {
            group['providerType'] = ['', Validators.required];
            group['providerTypeText'] = [''];
        }
        else {
            group['providerType'] = ['Counsellor']
        }

        return this.fb.group(group);
    }

    addDoctor(): void {
        this.familyDoctorClinicItem = this.form.get('familyDoctorClinic') as FormControl;
        this.familyDoctorClinicItem.setValidators([Validators.required]);// .validator = Validators.required;
        this.familyDoctorClinicItem.updateValueAndValidity();
    }

    clearDoctor(): void {
        this.familyDoctorClinicItem = this.form.get('familyDoctorClinic') as FormControl;
        this.familyDoctorClinicItem.clearValidators();
        this.familyDoctorClinicItem.updateValueAndValidity();

        this.familyDoctorClinicItem.patchValue('');
        let doctorFirstNameControl = this.form.get('familyDoctorFirstName');
        doctorFirstNameControl.patchValue('');

        let doctorLastNameControl = this.form.get('familyDoctorLastName');
        doctorLastNameControl.patchValue('');

        let doctorEmailControl = this.form.get('familyDoctorEmail');
        doctorEmailControl.patchValue('');

        let doctorPhoneControl = this.form.get('familyDoctorPhoneNumber');
        doctorPhoneControl.patchValue('');

        let doctorFaxControl = this.form.get('familyDoctorFax');
        doctorFaxControl.patchValue('');

        this.addressHelper.clearAddress(this.form, 'familyDoctorAddress');
        this.addressHelper.clearAddressValidatorsAndErrors(this.form, 'familyDoctorAddress');
    }

    doYouHaveMedicalServicesCoverageChange(val) {
        let haveMedicalCoverageProvinceControl = this.form.get('haveMedicalCoverageProvince');
        let haveMedicalCoverageProvinceOtherControl = this.form.get('haveMedicalCoverageProvinceOther');
        let personalHealthNumberControl = this.form.get('personalHealthNumber');

        if (val) {
            haveMedicalCoverageProvinceControl.patchValue('British Columbia');
            this.setControlValidators(haveMedicalCoverageProvinceControl, [Validators.required]);
        }
        else {
            this.clearControlValidators(haveMedicalCoverageProvinceControl);
            haveMedicalCoverageProvinceControl.patchValue('');
            haveMedicalCoverageProvinceOtherControl.patchValue('');
            personalHealthNumberControl.patchValue('');
        }
    }

    doYouHaveOtherHealthCoverageChange(val: boolean) {
        let otherHealthCoverageProviderNameControl = this.form.get('otherHealthCoverageProviderName');
        let otherHealthCoverageExtendedPlanNumberControl = this.form.get('otherHealthCoverageExtendedPlanNumber');

        if (!val) {
            otherHealthCoverageProviderNameControl.patchValue('');
            otherHealthCoverageExtendedPlanNumberControl.patchValue('');
        }
    }

    setDoctorPhoneValidators() {
        if (this.form.get('familyDoctorAddress.country').value === 'Canada' || this.form.get('familyDoctorAddress.country').value === 'United States of America') {
            this.phoneMinLength = 10;
        }
        else {
            this.phoneMinLength = 8;
        }

        let phoneControl = this.form.get('familyDoctorPhoneNumber');
        this.setControlValidators(phoneControl, [Validators.minLength(this.phoneMinLength), Validators.maxLength(this.phoneMaxLength)]);
        phoneControl.patchValue(phoneControl.value);
    }

    setProviderPhoneValidators(provider: AbstractControl) {
        if (provider.get('providerAddress.country').value === 'Canada' || provider.get('providerAddress.country').value === 'United States of America') {
            this.phoneMinLength = 10;
        }
        else {
            this.phoneMinLength = 8;
        }

        let phoneControl = provider.get('providerPhoneNumber');
        let faxControl = provider.get('providerFax');
        this.setControlValidators(phoneControl, [Validators.minLength(this.phoneMinLength), Validators.maxLength(this.phoneMaxLength)]);
        this.setControlValidators(faxControl, [Validators.minLength(this.phoneMinLength), Validators.maxLength(this.phoneMaxLength)]);
        phoneControl.patchValue(phoneControl.value);
        faxControl.patchValue(faxControl.value);
    }
}
