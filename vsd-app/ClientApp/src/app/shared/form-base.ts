import { ValidatorFn, AbstractControl, FormControl, FormGroup } from '@angular/forms';

export class FormBase {
  form: FormGroup;

  isFieldValid(field: string) {
    let formField = this.form.get(field);
    if (formField == null)
      return true;

    return this.form.get(field).valid || !this.form.get(field).touched;
  }

  isValidOrNotTouched(field: string) {
    return this.form.get(field).valid || !this.form.get(field).touched;
  }

  public rejectIfNotDigitOrBackSpace(event) {
    const acceptedKeys = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Control',
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    if (acceptedKeys.indexOf(event.key) === -1) {
      event.preventDefault();
    }
  }

  public customRequiredCheckboxValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control.value === true) {
        return null;
      } else {
        return { 'shouldBeTrue': 'But value is false' };
      }
    };
  }

  public customZipCodeValidator(pattern: RegExp, countryField: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.parent) {
        return null;
      }
      const country = control.parent.get(countryField).value;
      if (country !== 'Canada' && country !== 'United States of America') {
        return null;
      }
      const valueMatchesPattern = pattern.test(control.value);
      return valueMatchesPattern ? null : { 'regex-missmatch': { value: control.value } };
    };
  }

  public requiredCheckboxGroupValidator(checkboxFields: string[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.parent) {
        return null;
      }
      let valid = false;
      checkboxFields.forEach(f => {
        valid = valid || control.parent.get(f).value;
      });
      return valid ? null : { 'required-set': { value: control.value } };
    };
  }

  public requiredCheckboxChildValidator(checkboxField: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.parent || !control.parent.get(checkboxField)) {
        return null;
      }
      const parentIsChecked = control.parent.get(checkboxField).value;
      if (!parentIsChecked) {
        return null;
      }
      return control.value ? null : { 'required': { value: control.value } };
    };
  }

  controlsHaveValueCheck(controlKeys: Array<string>, formGroup: FormGroup): Array<boolean> {
    return controlKeys.map((item) => {
      // reset any errors already set (ON ALL GIVEN KEYS).
      formGroup.controls[item].setErrors(null);

      // Checks for empty string and empty array.
      let hasValue = (formGroup.controls[item].value instanceof Array) ? formGroup.controls[item].value.length > 0 :
        !(formGroup.controls[item].value === "");
      return (hasValue) ? false : true;
    });
  }

  conditionalAnyRequired(controlKeys: Array<string>): ValidatorFn {
    return (control: FormControl): { [key: string]: any } => {
      let formGroup = control.root;
      if (formGroup instanceof FormGroup) {

        // Only check if all FormControls are siblings(& present on the nearest FormGroup)
        if (controlKeys.every((item) => {
          return formGroup.get(item) != null;
        })) {
          let result = this.controlsHaveValueCheck(controlKeys, formGroup);

          // If any item is valid return null, if all are invalid return required error.
          return (result.some((item) => {
            return item === false;
          })) ? null : { required: true };
        }
      }
      return null;
    }
  }


  public hasValueSet(controlName: string): boolean {
    var control = this.form.get(controlName);

    if (control == null || control === undefined)
      return false;

    if (control.value == null || control.value === undefined)
      return false;

    if (control.value.length == 0 || control.value.length === undefined)
      return false;

    return control.value.length > 0;
  }

  public hasSignature(controlName: string): boolean {
    return this.hasValueSet(controlName);
  }

  public requiredSelectChildValidator(selectField: string, conditionalValue: any[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.parent
        || !control.parent.get(selectField)
        || conditionalValue.indexOf(control.parent.get(selectField).value) === -1) {
        return null;
      }
      const parentIsChecked = control.parent.get(selectField).value;
      if (!parentIsChecked) {
        return null;
      }
      return control.value ? null : { 'required': { value: control.value } };
    };
  }

  public valueOrEmpty(controlName: string): string {
    var control = this.form.get(controlName);

    if (control == null || control === undefined)
      return "--";

    if (control.value == null || control.value === undefined)
      return "--";

    if (control.value.length == 0 || control.value.length === undefined)
      return "--";

    return control.value;
  }


  public trimValue(control: FormControl) {
    const value = control.value;
    control.setValue('');
    control.setValue(value.trim());
  }
}
// More custom validation
// https://stackoverflow.com/questions/38204812/angular2-forms-validator-with-interrelated-fields/40416197#40416197
