import { POSTAL_CODE, ZIP_CODE } from "../regex.constants";
import { FormGroup, Validators } from "@angular/forms";
import { Address } from "../../interfaces/address.interface";

export class AddressHelper {
    postalRegex = POSTAL_CODE;
    zipRegex = ZIP_CODE;

    public clearAddressValidatorsAndErrors(form: FormGroup, field: string) {
        let options = { onlySelf: false, emitEvent: true };
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

        if (form.get(field + '.country').value === "Canada") {
            postalControl.setValidators([Validators.pattern(this.postalRegex)]);
        }
        else if (form.get(field + '.country').value === "United States of America") {
            postalControl.setValidators([Validators.pattern(this.zipRegex)]);
        }
        else {
            postalControl.clearValidators();
        }

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
        let options = { onlySelf: false, emitEvent: true };
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
            control.updateValueAndValidity(options);
        }
        if (form.get(field + '.country').value === "Canada") {
            postalControl.setValidators([Validators.required, Validators.pattern(this.postalRegex)]);
        }
        else if (form.get(field + '.country').value === "United States of America") {
            postalControl.setValidators([Validators.required, Validators.pattern(this.zipRegex)]);
        }
        else {
            postalControl.setValidators([Validators.required]);
        }
        // postalControl.markAsTouched();
        postalControl.updateValueAndValidity(options);
    }

    public hasAddressInfo(address: Address) {
        if (address.line1 || address.line2 || address.city || address.postalCode) {
            return true;
        }
        return false;
    }

    public clearAddress(form: FormGroup, field: string) {
        let addressControls = [
            form.get(field + '.city'),
            form.get(field + '.line1'),
            form.get(field + '.line2'),
            form.get(field + '.postalCode'),
        ];
        form.get(field + '.country').patchValue('Canada');
        form.get(field + '.province').patchValue('British Columbia');

        for (let control of addressControls) {
            control.patchValue('');
        }
    }

    public displayAddress(address: Address) {
        let display = address.line1 + '<br />';
        if (address.line2 != '')
            display += address.line2 + '<br />';
        if (address.city != '')
            display += address.city + '<br />';
        if (address.province != '')
            display += address.province + '<br />';
        if (address.country != '')
            display += address.country + '<br />';
        if (address.postalCode != '')
            display += address.postalCode;

        return display;
    }
}