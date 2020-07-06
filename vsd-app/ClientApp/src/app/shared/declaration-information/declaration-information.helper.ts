import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { ApplicationType } from "../enums-list";
import { POSTAL_CODE } from "../regex.constants";

export class DeclarationInfoHelper {
    postalRegex = POSTAL_CODE;
    public setupFormGroup(fb: FormBuilder, form_type: ApplicationType): FormGroup {
        let group = {
            declaredAndSigned: ['', Validators.requiredTrue],
            signature: ['', Validators.required],
        };

        return fb.group(group);
    }
}