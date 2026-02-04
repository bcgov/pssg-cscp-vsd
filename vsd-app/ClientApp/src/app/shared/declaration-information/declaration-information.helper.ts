import { UntypedFormBuilder, UntypedFormGroup, Validators, FormControl } from '@angular/forms';
import { ApplicationType } from '../enums-list';
import { POSTAL_CODE } from '../regex.constants';

export class DeclarationInfoHelper {
  postalRegex = POSTAL_CODE;
  public setupFormGroup(fb: UntypedFormBuilder, form_type: ApplicationType): UntypedFormGroup {
    let group = {
      declaredAndSigned: ['', Validators.requiredTrue],
      signature: ['', Validators.required]
    };

    return fb.group(group);
  }
}
