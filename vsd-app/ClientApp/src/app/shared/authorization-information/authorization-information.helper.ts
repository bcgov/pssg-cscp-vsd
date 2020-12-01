import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { ApplicationType } from "../enums-list";
import { POSTAL_CODE } from "../regex.constants";
import { EmailValidator } from "../validators/email.validator";

export class AuthInfoHelper {
    postalRegex = POSTAL_CODE;
    public setupFormGroup(fb: FormBuilder, form_type: ApplicationType): FormGroup {

        let group = {
            approvedAuthorityNotification: ['', Validators.requiredTrue],
            readAndUnderstoodTermsAndConditions: ['', Validators.requiredTrue],
            signName: ['', Validators.required],
            signature: ['', Validators.required],
            allowCvapStaffSharing: [0],
            authorizedPerson: fb.array([]),
            authorizedPersonAuthorizesDiscussion: [''],
            authorizedPersonSignature: [''],
        };

        return fb.group(group);
    }

    createAuthorizedPerson(fb: FormBuilder): FormGroup {
        return fb.group({
            providerType: ['', Validators.required],
            authorizedPersonFirstName: [''],
            authorizedPersonLastName: [''],
            authorizedPersonPhoneNumber: [''],
            authorizedPersonEmail: ['', [Validators.email]],
            authorizedPersonAgencyAddress: fb.group({
                line1: [''],
                line2: [''],
                city: [''],
                postalCode: ['', [Validators.pattern(this.postalRegex)]],  // 
                province: [{ value: 'British Columbia', disabled: false }],
                country: [{ value: 'Canada', disabled: false }],
            }),
            authorizedPersonRelationship: [''],
            authorizedPersonRelationshipOther: [''],
            authorizedPersonAgencyName: [''],
        });
    }
}
