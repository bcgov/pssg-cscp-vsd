import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, Validators, FormControl } from "@angular/forms";
import { COUNTRIES_ADDRESS } from './country-list';
import { POSTAL_CODE, ZIP_CODE } from '../regex.constants';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html'
})
export class AddressComponent implements OnInit {
  countryList = COUNTRIES_ADDRESS;
  postalRegex = POSTAL_CODE;
  zipRegex = ZIP_CODE;

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

      let postalControl = this.group['controls']['postalCode'] as FormControl;

      if (selectedCountry.name === "Other Country") {
        this.group['controls']['province'].patchValue('');
        postalControl.clearValidators();
        postalControl.updateValueAndValidity();
      }
      else if (selectedCountry.name === "Canada") {
        postalControl.setValidators([Validators.required, Validators.pattern(this.postalRegex)]);
        postalControl.updateValueAndValidity();
      }
      else if (selectedCountry.name === "United States of America") {
        postalControl.setValidators([Validators.required, Validators.pattern(this.zipRegex)]);
        postalControl.updateValueAndValidity();
      }
    }

  }

  ngOnInit() {
    if (this.showChildrenAsRequired === undefined)
      this.showChildrenAsRequired = true;

    let countryVal = this.group['controls']['country'].value.toString();
    let selectedCountry = COUNTRIES_ADDRESS.filter(c => c.name.toLowerCase() == countryVal.toLowerCase())[0];
    if (selectedCountry !== undefined) {
      this.provinceList = selectedCountry.areas;
      this.provinceType = selectedCountry.areaType;
      this.postalCodeType = selectedCountry.postalCodeName;
      this.postalCodeSample = selectedCountry.postalCodeSample;
    }
  }

}
