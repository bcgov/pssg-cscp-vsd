import { UntypedFormGroup, Validators } from '@angular/forms';
import { Address } from '../../interfaces/address.interface';
import { POSTAL_CODE, ZIP_CODE } from '../regex.constants';

export class AddressHelper {
  postalRegex = POSTAL_CODE;
  zipRegex = ZIP_CODE;

  public clearAddressValidatorsAndErrors(form: UntypedFormGroup, field: string) {
    let options = { onlySelf: false, emitEvent: true };
    let addressControls = [
      form.get(field + '.country'),
      form.get(field + '.province'),
      form.get(field + '.city'),
      form.get(field + '.line1')
    ];

    let postalControl = form.get(field + '.postalCode');

    for (let control of addressControls) {
      control.clearValidators();
      control.setErrors(null, options);
      // control.markAsTouched();
      control.updateValueAndValidity(options);
    }

    if (form.get(field + '.country').value === 'Canada') {
      postalControl.setValidators([Validators.pattern(this.postalRegex)]);
    } else if (form.get(field + '.country').value === 'United States of America') {
      postalControl.setValidators([Validators.pattern(this.zipRegex)]);
    } else {
      postalControl.clearValidators();
    }

    postalControl.setErrors(null, options);
    // postalControl.markAsTouched();
    postalControl.updateValueAndValidity(options);
  }

  public markAsTouched(form: UntypedFormGroup, field: string) {
    let addressControls = [
      form.get(field + '.country'),
      form.get(field + '.province'),
      form.get(field + '.city'),
      form.get(field + '.line1')
    ];

    let postalControl = form.get(field + '.postalCode');

    for (let control of addressControls) {
      control.markAsTouched();
    }
    postalControl.markAsTouched();
  }

  public setAddressAsRequired(form: UntypedFormGroup, field: string) {
    let options = { onlySelf: false, emitEvent: true };
    let addressControls = [
      form.get(field + '.country'),
      form.get(field + '.province'),
      form.get(field + '.city'),
      form.get(field + '.line1')
    ];

    let postalControl = form.get(field + '.postalCode');

    for (let control of addressControls) {
      control.setValidators([Validators.required]);
      // control.markAsTouched();
      control.updateValueAndValidity(options);
    }
    if (form.get(field + '.country').value === 'Canada') {
      postalControl.setValidators([Validators.required, Validators.pattern(this.postalRegex)]);
    } else if (form.get(field + '.country').value === 'United States of America') {
      postalControl.setValidators([Validators.required, Validators.pattern(this.zipRegex)]);
    } else {
      postalControl.setValidators([Validators.required]);
    }
    // postalControl.markAsTouched();
    postalControl.updateValueAndValidity(options);
  }

  /**
   * Updates only the postalCode validator on an address FormGroup based on its current country value.
   * Preserves any existing Validators.required on the postal code control.
   * Call this after restoring draft data to ensure the correct postal/zip pattern is applied.
   */
  public updatePostalCodeValidatorByCountry(addressGroup: UntypedFormGroup): void {
    if (!addressGroup) return;
    const postalControl = addressGroup.get('postalCode');
    if (!postalControl) return;

    const country: string = addressGroup.get('country')?.value ?? '';
    const isRequired = postalControl.hasValidator(Validators.required);

    if (country === 'Canada') {
      postalControl.setValidators(
        isRequired
          ? [Validators.required, Validators.pattern(this.postalRegex)]
          : [Validators.pattern(this.postalRegex)]
      );
    } else if (country === 'United States of America') {
      postalControl.setValidators(
        isRequired ? [Validators.required, Validators.pattern(this.zipRegex)] : [Validators.pattern(this.zipRegex)]
      );
    } else {
      postalControl.setValidators(isRequired ? [Validators.required] : null);
    }
    postalControl.updateValueAndValidity({ emitEvent: false });
  }

  public hasAddressInfo(address: Address) {
    if (address.line1 || address.line2 || address.city || address.postalCode) {
      return true;
    }
    return false;
  }

  public clearAddress(form: UntypedFormGroup, field: string) {
    let addressControls = [
      form.get(field + '.city'),
      form.get(field + '.line1'),
      form.get(field + '.line2'),
      form.get(field + '.postalCode')
    ];
    form.get(field + '.country').patchValue('Canada');
    form.get(field + '.province').patchValue('British Columbia');

    for (let control of addressControls) {
      control.patchValue('');
    }
  }

  public displayAddress(address: Address) {
    let display = address.line1 + '<br />';
    if (address.line2 != '') display += address.line2 + '<br />';
    if (address.city != '') display += address.city + '<br />';
    if (address.province != '') display += address.province + '<br />';
    if (address.country != '') display += address.country + '<br />';
    if (address.postalCode != '') display += address.postalCode;

    return display;
  }
}
