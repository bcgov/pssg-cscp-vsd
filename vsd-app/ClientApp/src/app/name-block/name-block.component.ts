import { Component, OnInit, forwardRef, OnDestroy, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, FormGroup, FormControl, FormBuilder, ControlValueAccessor, Validators, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';

export interface NameBlock {
  firstName: string;
  middleName: string;
  lastName: string;
}

@Component({
  selector: 'app-name-block',
  templateUrl: './name-block.component.html',
  styleUrls: ['./name-block.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NameBlockComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => NameBlockComponent),
      multi: true,
    }
  ]
})
export class NameBlockComponent implements ControlValueAccessor, OnDestroy {
  @Input() required = false;
  nameForm: FormGroup;
  subscriptions: Subscription[] = [];

  get value(): NameBlock {
    return this.nameForm.value;
  }
  set value(value: NameBlock) {
    this.nameForm.setValue(value);
    this.onChange(value);
    this.onTouched();
  }
  get firstName(): AbstractControl { return this.nameForm.get('firstName'); }
  get middleName(): AbstractControl { return this.nameForm.get('middleName'); }
  get lastName(): AbstractControl { return this.nameForm.get('lastName'); }

  constructor(private formBuilder: FormBuilder) {
    // set if required or not
    if (this.required) {
      this.nameForm = this.formBuilder.group({
        firstName: ['', Validators.required],
        middleName: [''],
        lastName: ['', Validators.required],
      });
    } else {
      this.nameForm = this.formBuilder.group({
        firstName: [''],
        middleName: [''],
        lastName: [''],
      });
    }

    this.subscriptions.push(
      // any time the inner form changes update the parent of any change
      this.nameForm.valueChanges.subscribe(value => {
        this.onChange(value);
        this.onTouched();
      })
    );
  }

  //!!!!!!!!!!!!!!! Needed interfaces for ControlValueAccessor !!!!!!!!!!!!//
  // Modify below sparingly. Just for how it talks to the parent.
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
    return this.nameForm.valid ? null : { profile: { valid: false, }, };
  }
}
