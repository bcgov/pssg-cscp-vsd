import { POSTAL_CODE } from "../regex.constants";
import { FormGroup, Validators } from "@angular/forms";
import { Address } from "../../interfaces/address.interface";

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

    public hasAddressInfo(address: Address) {
        if (address.line1 || address.line2 || address.city || address.postalCode) {
            return true;
        }
        return false;
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