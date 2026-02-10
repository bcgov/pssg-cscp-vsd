import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ApplicationType } from '../enums-list';
import { POSTAL_CODE } from '../regex.constants';
import { EmailMatchingValidator, EmailValidator } from '../validators/email.validator';

export class RepresentativeInfoHelper {
  postalRegex = POSTAL_CODE;
  public setupFormGroup(fb: UntypedFormBuilder, form_type: ApplicationType): UntypedFormGroup {
    let group = {
      completingOnBehalfOf: [0, [Validators.required, Validators.min(100000000), Validators.max(100000003)]], // Self: 100000000  Victim Service Worker: 100000001  Parent/Guardian: 100000002,
      representativeFirstName: [''],
      representativeMiddleName: [''],
      representativeLastName: [''],
      representativePreferredMethodOfContact: [0], // Phone = 100000000, Email = 100000001, Mail = 100000002
      representativePhoneNumber: [''],
      representativeAlternatePhoneNumber: [''],
      representativeEmail: ['', [EmailValidator()]],
      representativeConfirmEmail: ['', [EmailValidator(), EmailMatchingValidator('representativeEmail')]],

      applicantSameContactInfo: [''],
      mostRecentMailingAddressSameAsPersonal: [''],
      representativeAddress: fb.group({
        line1: [''],
        line2: [''],
        city: [''],
        postalCode: ['', [Validators.pattern(this.postalRegex)]], // ,
        province: [{ value: 'British Columbia', disabled: false }],
        country: [{ value: 'Canada', disabled: false }]
      }),
      documents: fb.array([]),
      relationshipToPerson: ['']
    };

    return fb.group(group);
  }
}
