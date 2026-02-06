import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
  standalone: false
})
export class FieldComponent implements OnInit {
  @Input() required: boolean;
  @Input() showChevrons = true;
  // TODO: eventually we need to determine validity based on the form control passed in instead of passing in valid as an input
  @Input() valid = true;
  @Input() label: string;
  @Input() tooltipReference: string;
  @Input() leadingText: string;
  @Input() errorMessage: string;
  @Input() disabled: boolean;
  @Input() formControl: FormControl;

  constructor() {}

  ngOnInit() {}

  // TODO: gradually move to this method instead of passing [required] as input value
  // as it causes mismatch between the form validation and the UI (* is shown when form dynamically changes condition validation)
  get isRequired(): boolean {
    // required is passed as an input
    if (this.required !== undefined) {
      return this.required;
    }

    // if required is not passed as an input, check if the form control has a required validator
    // if not - assume the field is not required
    return this.formControl?.hasValidator(Validators.required) || false;
  }
}
