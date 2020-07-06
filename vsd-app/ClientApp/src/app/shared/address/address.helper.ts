import { POSTAL_CODE } from "../regex.constants";
import { FormGroup, Validators } from "@angular/forms";

export class AddressHelper {
    postalRegex = POSTAL_CODE;

    public clearAddressValidatorsAndErrors(form: FormGroup, field: string) {
        let options = { onlySelf: true, emitEvent: false };
        let addressControls = [
            form.get(field + '.country'),
            form.get(field + '.province'),
            form.get(field + '.city'),
            form.get(field + '.line1'),
        ];

        let postalControl = form.get(field + '.postalCode');

        for (let control of addressControls) {
            control.clearValidators();
            control.setErrors(null, options);
            // control.markAsTouched();
            control.updateValueAndValidity(options);
        }

        postalControl.setValidators([Validators.pattern(this.postalRegex)]);
        postalControl.setErrors(null, options);
        // postalControl.markAsTouched();
        postalControl.updateValueAndValidity(options);
    }

    public markAsTouched(form: FormGroup, field: string) {
        let addressControls = [
            form.get(field + '.country'),
            form.get(field + '.province'),
            form.get(field + '.city'),
            form.get(field + '.line1'),
        ];

        let postalControl = form.get(field + '.postalCode');

        for (let control of addressControls) {
            control.markAsTouched();
        }
        postalControl.markAsTouched();
    }

    public setAddressAsRequired(form: FormGroup, field: string) {
        let addressControls = [
            form.get(field + '.country'),
            form.get(field + '.province'),
            form.get(field + '.city'),
            form.get(field + '.line1'),
        ];

        let postalControl = form.get(field + '.postalCode');

        for (let control of addressControls) {
            control.setValidators([Validators.required]);
            // control.markAsTouched();
            control.updateValueAndValidity();
        }
        postalControl.setValidators([Validators.required, Validators.pattern(this.postalRegex)]);
        // postalControl.markAsTouched();
        postalControl.updateValueAndValidity();
    }
}