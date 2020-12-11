import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { ApplicationType } from "../enums-list";
import { POSTAL_CODE } from "../regex.constants";

export class EmploymentInfoHelper {
    postalRegex = POSTAL_CODE;
    public setupFormGroup(fb: FormBuilder, form_type: ApplicationType): FormGroup {
        let group = {
            wereYouEmployedAtTimeOfCrime: [''], //, Validators.required],
            wereYouAtWorkAtTimeOfIncident: [''],
            haveYouAppliedToWorkSafe: [''],
            wsbcClaimNumber: [''],
            didYouMissWorkDueToCrime: [''], //, Validators.required],
            didYouLoseWages: [''],
            sin: ['', [Validators.minLength(9), Validators.maxLength(9)]],
            areYouSelfEmployed: [''],
            // mayContactEmployer: [''],
            haveYouAppliedForWorkersCompensation: [''],
            areYouStillOffWork: [''],
            daysWorkMissedStart: [''],
            daysWorkMissedEnd: [''],
            workersCompensationClaimNumber: [''],
            employers: fb.array([]),
            documents: fb.array([]),
        };

        return fb.group(group);
    }

    createEmployerInfo(fb: FormBuilder): FormGroup {
        return fb.group({
            employerName: [''],
            employerPhoneNumber: [''],
            employerFax: [''],
            employerEmail: ['', [Validators.email]],
            employerFirstName: [''],
            employerLastName: [''],
            employerAddress: fb.group({
                line1: ['',],
                line2: [''],
                city: ['',],
                postalCode: ['', [Validators.pattern(this.postalRegex)]],
                province: [{ value: 'British Columbia', disabled: false }],
                country: [{ value: 'Canada', disabled: false }],
            }),
            contactable: [''],
        });
    }
}