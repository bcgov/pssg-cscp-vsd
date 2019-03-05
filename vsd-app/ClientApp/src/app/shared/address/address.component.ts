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

  constructor() {

    var canada = COUNTRIES_ADDRESS.filter(c => c.name.toLowerCase() == 'canada')[0];
    this.provinceList = canada.areas;
    this.provinceType = canada.areaType;
    this.postalCodeType = canada.postalCodeName;
    this.postalCodeSample = canada.postalCodeSample;
  }

  isSubFieldValid(field: string) {
    let formField = this.group['controls'][field];  // this.group.controls should work, but it doesn't
    if (formField == null)
      return true;

    return formField.valid || !formField.touched;
  }

  updateLocation(event) {
    var selection = event.target.value.toLowerCase();
    var selectedCountry = COUNTRIES_ADDRESS.filter(c => c.name.toLowerCase() == selection)[0];
    this.provinceList = selectedCountry.areas;
    this.provinceType = selectedCountry.areaType;
    this.postalCodeType = selectedCountry.postalCodeName;
    this.postalCodeSample = selectedCountry.postalCodeSample;
  }

  ngOnInit() {
  }

}
