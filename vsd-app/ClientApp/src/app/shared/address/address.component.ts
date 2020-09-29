import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, Validators, FormControl } from "@angular/forms";
import { COUNTRIES_ADDRESS, preferred_countries } from './country-list';
import { POSTAL_CODE, ZIP_CODE } from '../regex.constants';
import { iLookupData, iProvince } from '../../models/lookup-data.model';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html'
})
export class AddressComponent implements OnInit {
  countryList = preferred_countries;
  preferred_countries = preferred_countries;
  postalRegex = POSTAL_CODE;
  zipRegex = ZIP_CODE;

  provinceList: iProvince[];
  provinceType: string;
  postalCodeType: string;
  postalCodeSample: string;

  @Input() group = FormGroup;
  @Input() showChildrenAsRequired: boolean = true;
  @Input() isDisabled: boolean = false;
  @Input() lookupData: iLookupData;

  constructor() {

    // var canada = COUNTRIES_ADDRESS.filter(c => c.name.toLowerCase() == 'canada')[0];
    // this.provinceList = canada.areas;
    // this.provinceType = canada.areaType;
    // this.postalCodeType = canada.postalCodeName;
    // this.postalCodeSample = canada.postalCodeSample;
  }

  ngOnInit() {
    let pref_countries = this.lookupData.countries.filter(c => preferred_countries.findIndex(pc => pc.vsd_countryid == c.vsd_countryid) >= 0);
    let remaining_countries = this.lookupData.countries.filter(c => preferred_countries.findIndex(pc => pc.vsd_countryid == c.vsd_countryid) < 0);

    pref_countries.sort(function (a, b) {
      return preferred_countries.findIndex(c => c.vsd_countryid == a.vsd_countryid) - preferred_countries.findIndex(c => c.vsd_countryid == b.vsd_countryid);
    });

    remaining_countries.sort((a, b) => a.vsd_name.localeCompare(b.vsd_name));

    this.countryList = pref_countries.concat(remaining_countries);

    var canada = this.lookupData.countries.filter(c => c.vsd_name.toLowerCase() == 'canada')[0];
    // this.provinceList = this.lookupData.provinces.filter(p => p._vsd_countryid_value === selectedCountry.vsd_countryid);
    this.provinceType = 'Province';
    this.postalCodeType = 'Postal Code';
    this.postalCodeSample = 'V9A 0A9';

    if (this.showChildrenAsRequired === undefined)
      this.showChildrenAsRequired = true;

    let countryVal = this.group['controls']['country'].value.toString();
    // let selectedCountry = COUNTRIES_ADDRESS.filter(c => c.name.toLowerCase() == countryVal.toLowerCase())[0];
    let selectedCountry = this.lookupData.countries.filter(c => c.vsd_name.toLowerCase() == countryVal.toLowerCase())[0];
    if (selectedCountry !== undefined) {
      this.provinceList = this.lookupData.provinces.filter(p => p._vsd_countryid_value === selectedCountry.vsd_countryid);
      // this.provinceType = selectedCountry.areaType;
      // this.postalCodeType = selectedCountry.postalCodeName;
      // this.postalCodeSample = selectedCountry.postalCodeSample;
    }
    else {
      selectedCountry = canada;
      this.provinceList = this.lookupData.provinces.filter(p => p._vsd_countryid_value === selectedCountry.vsd_countryid);
    }
    this.provinceList.sort((a, b) => a.vsd_name.localeCompare(b.vsd_name));
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
    var selectedCountry = this.lookupData.countries.filter(c => c.vsd_name.toLowerCase() == selection)[0];
    if (selectedCountry !== undefined) {
      this.provinceList = this.lookupData.provinces.filter(p => p._vsd_countryid_value === selectedCountry.vsd_countryid);
      this.provinceList.sort((a, b) => a.vsd_name.localeCompare(b.vsd_name));
      // this.provinceType = selectedCountry.areaType;
      // this.postalCodeType = selectedCountry.postalCodeName;
      // this.postalCodeSample = selectedCountry.postalCodeSample;

      let postalControl = this.group['controls']['postalCode'] as FormControl;

      if (selectedCountry.vsd_name === "Other Country") {
        this.group['controls']['province'].patchValue('');
        postalControl.clearValidators();
        postalControl.updateValueAndValidity();
      }
      else if (selectedCountry.vsd_name === "Canada") {
        postalControl.setValidators([Validators.required, Validators.pattern(this.postalRegex)]);
        postalControl.updateValueAndValidity();
      }
      else if (selectedCountry.vsd_name === "United States of America") {
        postalControl.setValidators([Validators.required, Validators.pattern(this.zipRegex)]);
        postalControl.updateValueAndValidity();
      }
    }
    else {
      this.provinceList = [];
    }

  }
}
