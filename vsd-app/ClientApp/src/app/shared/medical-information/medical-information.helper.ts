import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { ApplicationType } from "../enums-list";

export class MedicalInfoHelper {
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
            familyDoctorPhoneNumber: [''],
            familyDoctorAddressLine1: [''],
            familyDoctorAddressLine2: [''],

            hadOtherTreatments: ['', Validators.required],
            otherTreatments: fb.array([]),
        };

        if (form_type === ApplicationType.Victim_Application || form_type === ApplicationType.IFM_Application) {
            group['wereYouTreatedAtHospital'] = ['', Validators.required];
            group['treatedAtHospitalName'] = [''];
            group['treatedOutsideBc'] = [''];
            group['treatedOutsideBcHospitalName'] = [''];
            group['treatedAtHospitalDate'] = [''];
        }

        return fb.group(group);
    }
}
