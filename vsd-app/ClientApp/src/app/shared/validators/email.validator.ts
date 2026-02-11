import { AbstractControl, ValidatorFn } from '@angular/forms';

export function EmailValidator(): ValidatorFn {
  // regex that requires a proper email format with TLD (e.g., .com, .ca)
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value) {
      return null; // Don't validate empty values to allow optional controls
    }

    const valid = emailPattern.test(control.value.toLowerCase());
    return valid ? null : { invalidEmail: { value: control.value } };
  };
}

export function EmailMatchingValidator(confirmEmailInput: string) {
  let confirmEmailControl: AbstractControl;
  let emailControl: AbstractControl;

  return (control: AbstractControl) => {
    if (!control.parent) {
      return null;
    }

    if (!confirmEmailControl) {
      confirmEmailControl = control;
      emailControl = control.parent.get(confirmEmailInput) as AbstractControl;
      emailControl.valueChanges.subscribe(() => {
        confirmEmailControl.updateValueAndValidity();
      });
    }

    if (emailControl.value.toLocaleLowerCase() !== confirmEmailControl.value.toLocaleLowerCase()) {
      return {
        notMatch: true
      };
    }
    return null;
  };
}
