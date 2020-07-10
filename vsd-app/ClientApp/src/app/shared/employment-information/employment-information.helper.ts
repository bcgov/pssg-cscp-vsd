import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { ApplicationType } from "../enums-list";
import { POSTAL_CODE } from "../regex.constants";

export class EmploymentInfoHelper {
    postalRegex = POSTAL_CODE;
    public setupFormGroup(fb: FormBuilder, form_type: ApplicationType): FormGroup {
        let group = {
            wereYouEmployedAtTimeOfCrime: ['', Validators.required],
            wereYouAtWorkAtTimeOfIncident: [''],
            haveYouAppliedToWorkSafe: [''],
            wsbcClaimNumber: [''],
            didYouMissWorkDueToCrime: ['', Validators.required],
            didYouLoseWages: [''],
            areYouSelfEmployed: [''],
            mayContactEmployer: [''],
            haveYouAppliedForWorkersCompensation: [''],
            areYouStillOffWork: [''],
            daysWorkMissedStart: [''],
            daysWorkMissedEnd: [''],
            workersCompensationClaimNumber: [''],
            employers: fb.array([]),
        };

        return fb.group(group);
    }

    createEmployerInfo(fb: FormBuilder): FormGroup {
        return fb.group({
            employerName: ['', Validators.required],
            employerPhoneNumber: ['', Validators.required],
            employerFax: [''],
            employerEmail: ['', [Validators.required, Validators.email]],
            employerFirstName: [''],
            employerLastName: [''],
            employerAddress: fb.group({
                line1: ['', Validators.required],
                line2: [''],
                city: ['', Validators.required],
                postalCode: ['', [Validators.required, Validators.pattern(this.postalRegex)]],
                province: [{ value: 'British Columbia', disabled: false }],
                country: [{ value: 'Canada', disabled: false }],
            }),
            contactable: [''],
        });
    }
}