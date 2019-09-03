import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Address } from '../interfaces/address.interface';
import { COUNTRIES_ADDRESS_2 } from '../shared/address/country-list';


class AddressForm implements Address {
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  province: string = null; // made null so option can select default
  country: string = null;
  constructor(address?) {
    if (address) {
      this.line1 = address.line1 || null;
      this.line2 = address.line2 || null;
      this.city = address.city || null;
      this.postalCode = address.postalCode || null;
      this.province = address.province || null;
      this.country = address.country || null;
    }
  }
}

@Component({
  selector: 'app-address-block',
  templateUrl: './address-block.component.html',
  styleUrls: ['./address-block.component.scss'],
})
export class AddressBlockComponent implements OnInit {
  @Input() value: Address;
  @Output() valueChange = new EventEmitter<Address>();
  @Input() disabled = false; // TODO: disable the fields in the component when needed.
  @Input() required = false;
  // handy expose keys for iteration
  objectKeys = Object.keys;
  countryList = COUNTRIES_ADDRESS_2;
  postalRegex = /^[A-Za-z][0-9][A-Za-z][ ]?[0-9][A-Za-z][0-9]$/;

  addressForm: AddressForm;
  constructor() { }

  ngOnInit() {
    if (this.value) {
      // initialize the form from a value
      this.addressForm = new AddressForm(this.value);
    } else {
      // initialize the form from a blank object
      this.addressForm = new AddressForm();
    }
  }

  getCountryProperty(country: string, properyName: string): any {
    // Helper for country properties
    if (!country) country = 'Canada';
    if (!properyName) properyName = 'areaType';
    // return 'Province' by default.
    return this.countryList[country][properyName];
  }

  changeCountry() {
    this.addressForm.postalCode = null;
    this.addressForm.province = null;
  }
  /** This validation is triggered whenever the form is changed. */
  validate(validationState: boolean) {
    //TODO: remove all parts that may not fit the business logic. They could have changed their mind on a flag, added an answer so a blank element that shouldn't exist does exist.
    this.valueChange.emit(this.addressForm);
  }
}
