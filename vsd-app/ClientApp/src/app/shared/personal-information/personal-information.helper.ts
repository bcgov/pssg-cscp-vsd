import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { ApplicationType } from "../enums-list";
import { POSTAL_CODE } from "../regex.constants";
import { EmailValidator } from "../validators/email.validator";

export class PersonalInfoHelper {
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
            sin: ['', [Validators.minLength(9), Validators.maxLength(9)]],
            occupation: [''],
            indigenousStatus: [0, [Validators.required, Validators.min(100000000), Validators.max(100000004)]],

            preferredMethodOfContact: [0, [Validators.required, Validators.min(1), Validators.max(100000002)]], // Phone = 2, Email = 1, Mail = 4, Alternate Mail = 100000002

            permissionToContactViaMethod: [false],
            agreeToCvapCommunicationExchange: [''],

            phoneNumber: ['', [Validators.minLength(10), Validators.maxLength(15)]],
            leaveVoicemail: [0],
            alternatePhoneNumber: [''],

            email: ['', [Validators.email]],
            confirmEmail: ['', [
                Validators.email,
                EmailValidator('email')
            ]],

            doNotLiveAtAddress: [false],
            mailRecipient: [''],
            primaryAddress: fb.group({
                line1: ['', [Validators.required]],
                line2: [''],
                city: ['', [Validators.required]],
                postalCode: ['', [Validators.required, Validators.pattern(this.postalRegex)]],
                province: [{ value: 'British Columbia', disabled: false }, [Validators.required]],
                country: [{ value: 'Canada', disabled: false }, [Validators.required]],
            }),
            alternateAddress: fb.group({
                line1: [''],
                line2: [''],
                city: [''],
                postalCode: ['', [Validators.pattern(this.postalRegex)]],
                province: [{ value: 'British Columbia', disabled: false }],
                country: [{ value: 'Canada', disabled: false }],
            }),
        }

        if (form_type === ApplicationType.IFM_Application) {
            group['relationshipToVictim'] = ['', [Validators.required]];
            group['relationshipToVictimOther'] = [''];
        }

        if (form_type === ApplicationType.Witness_Application) {
            group['relationshipToVictim'] = ['Other'];
            group['relationshipToVictimOther'] = ['', [Validators.required]];
        }

        if (form_type === ApplicationType.Victim_Application) {
            group['maritalStatus'] = [0, [Validators.required, Validators.min(100000000), Validators.max(100000006)]];
        }

        return fb.group(group);
    }
}