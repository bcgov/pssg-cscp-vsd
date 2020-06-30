import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { ApplicationType } from "../enums-list";

export class AuthInfoHelper {
    public setupFormGroup(fb: FormBuilder, form_type: ApplicationType): FormGroup {

        let group = {
            approvedAuthorityNotification: ['', Validators.requiredTrue],
            readAndUnderstoodTermsAndConditions: ['', Validators.requiredTrue],
            signature: ['', Validators.required],
            allowCvapStaffSharing: ['', Validators.required],
            authorizedPerson: fb.array([]),
            authorizedPersonAuthorizesDiscussion: [''],
            authorizedPersonSignature: [''],
        };

        return fb.group(group);
    }
}