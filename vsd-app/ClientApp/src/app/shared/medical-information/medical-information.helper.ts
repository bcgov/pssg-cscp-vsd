import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ApplicationType } from '../enums-list';
import { POSTAL_CODE } from '../regex.constants';
import { EmailValidator } from '../validators/email.validator';

export class MedicalInfoHelper {
  postalRegex = POSTAL_CODE;
  public setupFormGroup(fb: UntypedFormBuilder, form_type: ApplicationType): UntypedFormGroup {
    let group = {
      doYouHaveMedicalServicesCoverage: ['', Validators.required],
      haveMedicalCoverageProvince: ['British Columbia'],
      haveMedicalCoverageProvinceOther: [''],
      personalHealthNumber: [''],

      doYouHaveOtherHealthCoverage: ['', Validators.required],
      otherHealthCoverageProviderName: [''],
      otherHealthCoverageExtendedPlanNumber: [''],

      beingTreatedByFamilyDoctor: ['', Validators.required],
      familyDoctorClinic: [''],
      familyDoctorFirstName: [''],
      familyDoctorLastName: [''],
      familyDoctorEmail: ['', [EmailValidator()]],
      familyDoctorPhoneNumber: [''],
      familyDoctorFax: [''],
      familyDoctorAddress: fb.group({
        line1: [''],
        line2: [''],
        city: [''],
        postalCode: ['', [Validators.pattern(this.postalRegex)]],
        province: [{ value: 'British Columbia', disabled: false }],
        country: [{ value: 'Canada', disabled: false }]
      }),
      // familyDoctorAddressLine1: [''],
      // familyDoctorAddressLine2: [''],

      hadOtherTreatments: ['', Validators.required],
      otherTreatments: fb.array([])
    };

    if (form_type === ApplicationType.Victim_Application) {
      group['wereYouTreatedAtHospital'] = ['', Validators.required];
      group['treatedAtHospitalName'] = [''];
      group['treatedOutsideBc'] = [false];
      group['treatedOutsideBcHospitalName'] = [''];
      group['treatedAtHospitalDate'] = [''];
    }

    return fb.group(group);
  }
}
