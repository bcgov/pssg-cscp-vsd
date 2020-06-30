import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { ApplicationType } from "../enums-list";
import { POSTAL_CODE } from "../regex.constants";
// import { EmailValidator } from "../validators/email.validator";

export class RepresentativeInfoHelper {
    postalRegex = POSTAL_CODE;
    public setupFormGroup(fb: FormBuilder, form_type: ApplicationType): FormGroup {
        let group = {
            completingOnBehalfOf: [0, [Validators.required, Validators.min(100000000), Validators.max(100000003)]], // Self: 100000000  Victim Service Worker: 100000001  Parent/Guardian: 100000002,
            representativeFirstName: [''], //, Validators.required],
            representativeMiddleName: [''],
            representativeLastName: [''], //, Validators.required],
            representativePreferredMethodOfContact: [0],   // Phone = 100000000, Email = 100000001, Mail = 100000002
            representativePhoneNumber: [''],
            representativeAlternatePhoneNumber: [''],
            representativeEmail: [''],
            representativeConfirmEmail: [''],

            // representativeEmail: ['', [Validators.email]], //, [Validators.required, Validators.email]],
            // representativeConfirmEmail: ['', [
            //     Validators.email,
            //     EmailValidator('representativeEmail')
            // ]],

            representativeAddress: fb.group({
                line1: [''],
                line2: [''],
                city: [''],
                postalCode: ['', [Validators.pattern(this.postalRegex)]],  // , 
                province: [{ value: 'British Columbia', disabled: false }],
                country: [{ value: 'Canada', disabled: false }],
            }),
            legalGuardianFiles: fb.group({
                filename: [''],
                body: [''],
            }),
            relationshipToPerson: [''],
        };

        // if (form_type === ApplicationType.Victim_Application || form_type === ApplicationType.IFM_Application) {

        // }

        return fb.group(group);
    }
}