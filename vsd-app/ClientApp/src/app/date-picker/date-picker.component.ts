//TODO: This component hasn't been used in the app so it is disposeable right now and is untested. I had to change context. -Curtis

import { Component, forwardRef, OnDestroy, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    }
  ]
})
export class DatePickerComponent implements ControlValueAccessor, OnDestroy {
  @Input() required = false;
  dateForm: FormGroup;
  subscriptions: Subscription[] = [];

  // TODO: formbuilder is overkill but I'm on a timecrunch and have it working in onther forms.
  constructor(private formBuilder: FormBuilder) {
    if (this.required) {
      this.dateForm = this.formBuilder.group({
        date: ['', Validators.required],
      });
    } else {
      this.dateForm = this.formBuilder.group({
        date: [''],
      });
    }

    //watch the changes to the field
    this.subscriptions.push(
      // any time the inner form changes update the parent of any change
      this.dateForm.valueChanges.subscribe(value => {
        this.onChange(value);
        this.onTouched();
      })
    );
  }

  //!!!!!!!!!!!!!!! Needed interfaces for ControlValueAccessor !!!!!!!!!!!!//
  // Modify below sparingly. Just for how it talks to the parent.
  get value(): Date {
    return this.dateForm.value;
  }
  set value(value: Date) {
    this.dateForm.setValue(value);
    this.onChange(value);
    this.onTouched();
  }
  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
  onChange: any = () => { };
  onTouched: any = () => { };
  registerOnChange(fn) {
    this.onChange = fn;
  }
  writeValue(value) {
    if (value) {
      this.value = value;
    }
  }
  registerOnTouched(fn) {
    this.onTouched = fn;
  }
  // communicate the inner form validation to the parent form
  validate(_: FormControl) {
    return this.dateForm.valid ? null : { profile: { valid: false, }, };
  }

}
