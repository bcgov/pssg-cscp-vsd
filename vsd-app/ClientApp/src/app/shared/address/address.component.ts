import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, Validators } from "@angular/forms";
import { COUNTRIES_ADDRESS } from './country-list';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html'
})
export class AddressComponent implements OnInit {
  countryList = COUNTRIES_ADDRESS;

  provinceList: string[];
  provinceType: string;
  postalCodeType: string;
  postalCodeSample: string;

  @Input() group = FormGroup;
  @Input() showChildrenAsRequired: boolean = true;
  @Input() isDisabled: boolean = false;

  constructor() {

    var canada = COUNTRIES_ADDRESS.filter(c => c.name.toLowerCase() == 'canada')[0];
    this.provinceList = canada.areas;
    this.provinceType = canada.areaType;
    this.postalCodeType = canada.postalCodeName;
    this.postalCodeSample = canada.postalCodeSample;
  }

  isSubFieldValid(field: string, disabled: boolean) {
    if (disabled === true) return true;
    let formField = this.group['controls'][field];
    if (formField == null)
      return true;

    return formField.valid || !formField.touched;
  }

  updateLocation(event) {
    var selection = event.target.value.toLowerCase();
    var selectedCountry = COUNTRIES_ADDRESS.filter(c => c.name.toLowerCase() == selection)[0];
    if (selectedCountry !== undefined) {
      this.provinceList = selectedCountry.areas;
      this.provinceType = selectedCountry.areaType;
      this.postalCodeType = selectedCountry.postalCodeName;
      this.postalCodeSample = selectedCountry.postalCodeSample;
    }
  }

  ngOnInit() {
    if (this.showChildrenAsRequired === undefined)
      this.showChildrenAsRequired = true;

    let selectedCountry = COUNTRIES_ADDRESS.filter(c => c.name.toLowerCase() == this.group['controls']['country'].value.toLowerCase())[0];
    if (selectedCountry !== undefined) {
      this.provinceList = selectedCountry.areas;
      this.provinceType = selectedCountry.areaType;
      this.postalCodeType = selectedCountry.postalCodeName;
      this.postalCodeSample = selectedCountry.postalCodeSample;
    }
  }

}
