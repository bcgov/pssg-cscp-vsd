import { Component, Input, forwardRef, OnDestroy } from '@angular/core';
import { Address } from '../interfaces/address.interface';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { COUNTRIES_ADDRESS_2, iCountry } from '../shared/address/country-list';

@Component({
  selector: 'app-address-block',
  templateUrl: './address-block.component.html',
  styleUrls: ['./address-block.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AddressBlockComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AddressBlockComponent),
      multi: true,
    }
  ]
})
export class AddressBlockComponent implements ControlValueAccessor, OnDestroy {
  // is this control required?
  @Input() required: boolean = false;

  addressForm: FormGroup;
  subscriptions: Subscription[] = [];

  countries: string[];
  currentCountry: iCountry;

  get value(): Address {
    return this.addressForm.value;
  }
  set value(value: Address) {
    this.addressForm.setValue(value);
    this.onChange(value);
    this.onTouched();
  }
  constructor(private formBuilder: FormBuilder) {
    // build the formbuilder form
    this.buildForm();

    // set defaults
    this.countries = Object.keys(COUNTRIES_ADDRESS_2);
    this.setCountryName('Canada');

    this.subscriptions.push(
      // any time the inner form changes update the parent of any change
      this.addressForm.valueChanges.subscribe(value => {
        this.onChange(value);
        this.onTouched();
      })
    );
  }

  // This is dumb but required
  get country(): AbstractControl { return this.addressForm.get('country'); }
  get city(): AbstractControl { return this.addressForm.get('city'); }
  get province(): AbstractControl { return this.addressForm.get('province'); }
  get postalCode(): AbstractControl { return this.addressForm.get('postalCode'); }
  get line1(): AbstractControl { return this.addressForm.get('line1'); }

  buildForm() {
    // use form builder to build the correct form
    if (this.required) {
      // create the form in a way that makes filling it out required
      this.addressForm = this.formBuilder.group({
        country: ['', Validators.required],
        city: ['', Validators.required],
        province: ['', Validators.required],
        postalCode: ['', Validators.required],
        line1: ['', Validators.required],
        line2: [''],
      });
    } else {
      // create the form in a not-required way
      this.addressForm = this.formBuilder.group({
        country: [''],
        city: [''],
        province: [''],
        postalCode: [''],
        line1: [''],
        line2: [''],
      });
    }
  }
  setCountryName(country: string) {
    if (country) {
      // get the country of interest
      this.currentCountry = COUNTRIES_ADDRESS_2[country];
      // clear the existing value of the province and postal code.
      this.addressForm.get('province').setValue('');
      this.addressForm.get('postalCode').setValue('');
    } else {
      // no country supplied? Default is Canada
      this.setCountryName('Canada');
    }
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
    return this.addressForm.valid ? null : { profile: { valid: false, }, };
  }
}
