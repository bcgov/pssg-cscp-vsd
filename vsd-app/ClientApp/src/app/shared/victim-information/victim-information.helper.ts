import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { ApplicationType } from "../enums-list";
import { POSTAL_CODE } from "../regex.constants";
import { EmailValidator } from "../validators/email.validator";

export class VictimInfoHelper {
    postalRegex = POSTAL_CODE;
    public setupFormGroup(fb: FormBuilder, form_type: ApplicationType): FormGroup {
        let group = {
            firstName: ['', Validators.required],
            middleName: [''],
            lastName: ['', Validators.required],

            iHaveOtherNames: [''],
            otherFirstName: [''],
            otherLastName: [''],
            dateOfNameChange: [''],

            gender: [0, [Validators.required, Validators.min(100000000), Validators.max(100000002)]],
            birthDate: ['', [Validators.required]],
            maritalStatus: [0, [Validators.required, Validators.min(100000000), Validators.max(100000006)]],

            phoneNumber: [''],
            alternatePhoneNumber: [''],
            email: [''],
            confirmEmail: [''],
            // , [
            //     Validators.email,
            //     EmailValidator('email')
            // ]],

            // Bind a subscribe event on this field being true. Change victim primary address when applicant address changes
            mostRecentMailingAddressSameAsPersonal: ['', Validators.required],

            primaryAddress: fb.group({
                line1: [''],//, Validators.required],
                line2: [''],
                city: [''],//, Validators.required],
                postalCode: ['', [Validators.pattern(this.postalRegex)]],//, Validators.required]],
                province: [{ value: 'British Columbia', disabled: false }],
                country: [{ value: 'Canada', disabled: false }],
            }),
        };

        if (form_type === ApplicationType.IFM_Application) {
            group['sin'] = ['', [Validators.minLength(9), Validators.maxLength(9)]];
            group['occupation'] = [''];
        }

        return fb.group(group);
    }
}