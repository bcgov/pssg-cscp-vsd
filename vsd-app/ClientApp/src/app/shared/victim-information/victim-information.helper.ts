import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { POSTAL_CODE } from '../regex.constants';
import { EmailMatchingValidator, EmailValidator } from '../validators/email.validator';

/**
 * Helper class for setting up victim information form.
 *
 * @export
 * @class VictimInfoHelper
 */
export class VictimInfoHelper {
  /**
   * Sets up the form group for the Victim Application.
   *
   * @param {FormBuilder} fb
   * @return {*}  {FormGroup}
   * @memberof VictimInfoHelper
   */
  public setupFormGroupForVictimApplication(fb: UntypedFormBuilder): UntypedFormGroup {
    let group = {
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],

      iHaveOtherNames: [''],
      otherFirstName: [''],
      otherLastName: [''],
      dateOfNameChange: [''],

      gender: [null],
      otherGender: [''],
      pronouns: [null],
      otherPronouns: [''],
      raceEthnicity: [null],
      otherRaceEthnicity: [''],
      maritalStatus: [null, [Validators.required, Validators.min(100000000), Validators.max(100000006)]],

      victimSameContactInfo: [''],
      phoneNumber: [''],
      alternatePhoneNumber: [''],
      email: [''],
      confirmEmail: ['', [EmailValidator(), EmailMatchingValidator('email')]],

      mostRecentMailingAddressSameAsPersonal: [''],

      primaryAddress: fb.group({
        line1: [''],
        line2: [''],
        city: [''],
        postalCode: ['', [Validators.pattern(POSTAL_CODE)]],
        province: [{ value: 'British Columbia', disabled: false }],
        country: [{ value: 'Canada', disabled: false }]
      })
    };

    return fb.group(group);
  }

  /**
   * Sets up the form group for the Witness Application.
   *
   * @param {FormBuilder} fb
   * @return {*}  {FormGroup}
   * @memberof VictimInfoHelper
   */
  public setupFormGroupForWitnessApplication(fb: UntypedFormBuilder): UntypedFormGroup {
    let group = {
      firstName: [''],
      middleName: [''],
      lastName: [''],

      iHaveOtherNames: [''],
      otherFirstName: [''],
      otherLastName: [''],
      dateOfNameChange: [''],

      birthDate: [null],

      gender: [null],
      otherGender: [''],
      pronouns: [null],
      otherPronouns: [''],
      raceEthnicity: [null],
      otherRaceEthnicity: [''],
      maritalStatus: [null, [Validators.required, Validators.min(100000000), Validators.max(100000006)]],

      victimSameContactInfo: [''],
      phoneNumber: [''],
      alternatePhoneNumber: [''],
      email: [''],
      confirmEmail: ['', [EmailValidator(), EmailMatchingValidator('email')]],

      mostRecentMailingAddressSameAsPersonal: [''],

      primaryAddress: fb.group({
        line1: [''],
        line2: [''],
        city: [''],
        postalCode: ['', [Validators.pattern(POSTAL_CODE)]],
        province: [{ value: 'British Columbia', disabled: false }],
        country: [{ value: 'Canada', disabled: false }]
      })
    };

    return fb.group(group);
  }

  /**
   * Sets up the form group for the Immediate Family Member (IFM) Application.
   *
   * @param {FormBuilder} fb
   * @return {*}  {FormGroup}
   * @memberof VictimInfoHelper
   */
  public setupFormGroupForIfmApplication(fb: UntypedFormBuilder): UntypedFormGroup {
    let group = {
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],

      iHaveOtherNames: [''],
      otherFirstName: [''],
      otherLastName: [''],
      dateOfNameChange: [''],

      sin: ['', [Validators.minLength(9), Validators.maxLength(9)]],
      occupation: [''],
      birthDate: [null, [Validators.required]],

      gender: [null],
      otherGender: [''],
      pronouns: [null],
      otherPronouns: [''],
      raceEthnicity: [null],
      otherRaceEthnicity: [''],
      maritalStatus: [null, [Validators.required, Validators.min(100000000), Validators.max(100000006)]],

      victimSameContactInfo: [''],
      phoneNumber: [''],
      alternatePhoneNumber: [''],
      email: [''],
      confirmEmail: ['', [EmailValidator(), EmailMatchingValidator('email')]],

      mostRecentMailingAddressSameAsPersonal: [''],

      primaryAddress: fb.group({
        line1: [''],
        line2: [''],
        city: [''],
        postalCode: ['', [Validators.pattern(POSTAL_CODE)]],
        province: [{ value: 'British Columbia', disabled: false }],
        country: [{ value: 'Canada', disabled: false }]
      })
    };

    return fb.group(group);
  }
}
