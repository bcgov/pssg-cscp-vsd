import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { ApplicationType } from "../enums-list";
import { POSTAL_CODE } from "../regex.constants";

export class MedicalInfoHelper {
    postalRegex = POSTAL_CODE;
    public setupFormGroup(fb: FormBuilder, form_type: ApplicationType): FormGroup {
        let group = {
            doYouHaveMedicalServicesCoverage: ['', Validators.required],
            haveMedicalCoverageProvince: ['British Columbia'],
            haveMedicalCoverageProvinceOther: [''],
            personalHealthNumber: [''],

            doYouHaveOtherHealthCoverage: ['', Validators.required],
            otherHealthCoverageProviderName: [''],
            otherHealthCoverageExtendedPlanNumber: [''],

            beingTreatedByFamilyDoctor: ['', Validators.required],
            familyDoctorName: [''],
            familyDoctorEmail: ['', [Validators.email]],
            familyDoctorPhoneNumber: [''],
            familyDoctorFax: [''],
            familyDoctorAddress: fb.group({
                line1: [''],
                line2: [''],
                city: [''],
                postalCode: ['', [Validators.pattern(this.postalRegex)]],
                province: [{ value: 'British Columbia', disabled: false }],
                country: [{ value: 'Canada', disabled: false }],
            }),
            // familyDoctorAddressLine1: [''],
            // familyDoctorAddressLine2: [''],

            hadOtherTreatments: ['', Validators.required],
            otherTreatments: fb.array([]),
        };

        if (form_type === ApplicationType.Victim_Application) {
            group['wereYouTreatedAtHospital'] = ['', Validators.required];
            group['treatedAtHospitalName'] = [''];
            group['treatedOutsideBc'] = [''];
            group['treatedOutsideBcHospitalName'] = [''];
            group['treatedAtHospitalDate'] = [''];
        }

        return fb.group(group);
    }
}
