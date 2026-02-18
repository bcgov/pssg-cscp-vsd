import { Component, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

export type InputType = 'text' | 'tel' | 'email' | 'number' | 'phone' | 'password' | 'date';
export type ControlType = 'input' | 'select';

export type Option = { label: string; value: any };

@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.css'],
  standalone: false
})
export class FormFieldComponent {
  @Input() type: InputType = 'text';
  @Input() controlType: ControlType = 'input';

  @Input() id: string;
  @Input() label: string;
  @Input() placeholder: string = '';
  @Input() control?: FormControl;
  @Input() mask: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() errorMessage: string = 'This field is required';
  @Input() trimOnBlur: boolean = true;
  @Input() options?: Option[];

  constructor() {}

  get isDirtyOrTouched(): boolean {
    if (!this.control) return false;
    return this.control.dirty || this.control.touched;
  }

  get hasError(): boolean {
    if (!this.control) return false;
    return this.control.invalid && this.isDirtyOrTouched;
  }

  get isRequired(): boolean {
    return this.required || (this.control?.hasValidator && this.control.hasValidator(Validators.required));
  }

  get error(): string {
    if (!this.control) return '';
    if (this.control.hasError('required')) return this.errorMessage;
    if (this.control.hasError('invalidEmail')) return 'Please enter a valid email address';
    return '';
  }

  onBlur(): void {
    if (this.trimOnBlur && this.control?.value && typeof this.control.value === 'string') {
      const trimmedValue = this.control.value.trim();
      if (trimmedValue !== this.control.value) {
        this.control.setValue(trimmedValue);
      }
    }
  }
}
