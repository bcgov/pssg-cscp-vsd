import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { IOptionSetVal, ResitutionForm } from "../../enums-list";
import { POSTAL_CODE } from "../../regex.constants";
import { EmailValidator } from "../../validators/email.validator";

export class RestitutionInfoHelper {
    postalRegex = POSTAL_CODE;
    public setupFormGroup(fb: FormBuilder, form_type: IOptionSetVal): FormGroup {
        let group = {
            firstName: ['', Validators.required],
            middleName: [''],
            lastName: ['', Validators.required],
            gender: [0, [Validators.required, Validators.min(100000000), Validators.max(100000002)]],
            birthDate: ['', [Validators.required]],

            contactInformation: fb.group({
                preferredMethodOfContact: [null, [Validators.required, Validators.min(1), Validators.max(100000002)]], // Phone = 2, Email = 1, Mail = 4, Alternate Mail = 100000002

                mailingAddress: fb.group({
                    line1: ['', [Validators.required]],
                    line2: [''],
                    city: ['', [Validators.required]],
                    postalCode: ['', [Validators.required, Validators.pattern(this.postalRegex)]],
                    province: [{ value: 'British Columbia', disabled: false }, [Validators.required]],
                    country: [{ value: 'Canada', disabled: false }, [Validators.required]],
                }),

                phoneNumber: ['', [Validators.minLength(10), Validators.maxLength(15)]],
                alternatePhoneNumber: [''],
                email: ['', [Validators.email]],
                confirmEmail: ['', [
                    Validators.email,
                    EmailValidator('email')
                ]],
                leaveMessage: [''],
            }),


            courtFiles: fb.array([this.createCourtFile(fb)]),

            documents: fb.array([]),

            declaredAndSigned: ['', Validators.requiredTrue],
            signature: ['', Validators.required],
        }

        if (form_type.val === ResitutionForm.Victim.val) {
            group["authoriseVictimDesignate"] = ['', Validators.required];
            group["designate"] = fb.array([]);
            group["vsw"] = fb.array([this.createVSW(fb)]);
        }

        if (form_type.val === ResitutionForm.Offender.val) {
            group["probationOfficerFirstName"] = [''];
            group["probationOfficerLastName"] = [''];
            group["probationOfficerCustodyLocation"] = [''];
            group["probationOfficerPhoneNumber"] = [''];
            group["probationOfficerEmail"] = ['', [Validators.email]];
        }

        return fb.group(group);
    }

    createCourtFile(fb: FormBuilder): FormGroup {
        return fb.group({
            firstName: [''],
            middleName: [''],
            lastName: [''],
            relationship: [''],
            fileNumber: [''],
            location: [''],
        });
    }

    createDesignate(fb: FormBuilder): FormGroup {
        return fb.group({
            firstName: ['', [Validators.required]],
            middleName: [''],
            lastName: ['', [Validators.required]],
            actOnBehalf: [false],
        });
    }

    createVSW(fb: FormBuilder): FormGroup {
        return fb.group({
            firstName: [''],
            lastName: [''],
            program: [''],
            email: ['', [Validators.email]],
        });
    }
}