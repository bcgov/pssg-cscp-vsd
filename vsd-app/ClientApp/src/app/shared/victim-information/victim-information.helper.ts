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
            maritalStatus: [0, [Validators.required, Validators.min(100000000), Validators.max(100000006)]],

            victimSameContactInfo: [''],
            phoneNumber: [''],
            alternatePhoneNumber: [''],
            email: [''],
            confirmEmail: ['', [
                Validators.email,
                EmailValidator('email')
            ]],

            mostRecentMailingAddressSameAsPersonal: [''],

            primaryAddress: fb.group({
                line1: [''],
                line2: [''],
                city: [''],
                postalCode: ['', [Validators.pattern(this.postalRegex)]],
                province: [{ value: 'British Columbia', disabled: false }],
                country: [{ value: 'Canada', disabled: false }],
            }),
        };

        if (form_type === ApplicationType.IFM_Application) {
            group['sin'] = ['', [Validators.minLength(9), Validators.maxLength(9)]];
            group['occupation'] = [''];
            group['birthDate'] = ['', [Validators.required]];
        }
        else if (form_type === ApplicationType.Witness_Application) {
            group['birthDate'] = [''];
        }

        return fb.group(group);
    }
}