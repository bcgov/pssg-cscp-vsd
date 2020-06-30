// import { FormControl, AbstractControl, ValidatorFn } from '@angular/forms';

// export function EmailValidator(confirmEmailInput: string): ValidatorFn {
//   let confirmEmailControl: AbstractControl;
//   let emailControl: AbstractControl;

//   return (control: AbstractControl) => {
//     if (!control.parent) {
//       return null;
//     }

//     if (!confirmEmailControl) {
//       confirmEmailControl = control;
//       emailControl = control.parent.get(confirmEmailInput) as AbstractControl;
//       emailControl.valueChanges.subscribe(() => {
//         confirmEmailControl.updateValueAndValidity();
//       });
//     }

//     if (
//       emailControl.value.toLocaleLowerCase() !==
//       confirmEmailControl.value.toLocaleLowerCase()
//     ) {
//       return {
//         notMatch: true
//       };
//     }
//     return null;
//   };
// }