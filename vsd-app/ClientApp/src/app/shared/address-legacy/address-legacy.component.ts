import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from "@angular/forms";
import { COUNTRIES_ADDRESS_LEGACY } from './country-list-legacy';

/*
As far as I know this project is for the CVAP Application pages.
This project contains files for restitution applications (I've not heard them mentioned at all)
So I'm not sure if they belong in this project (were they copied from somewhere else?)
Or if they are just a previous part of this project.

Anyhow, much improvements have been made to the address component that the CVAP Applications use.
To not break the old restitution pages, and to not update them since no change has been asked for,
I've created this "legacy" version of the address component that doesn't use dynamic lookup data
from COAST master data.
*/

@Component({
  selector: 'app-address-legacy',
  templateUrl: './address-legacy.component.html'
})
export class AddressLegacyComponent implements OnInit {
  countryList = COUNTRIES_ADDRESS_LEGACY;

  provinceList: string[];
  provinceType: string;
  postalCodeType: string;
  postalCodeSample: string;

  @Input() group = FormGroup;
  @Input() showChildrenAsRequired: boolean = true;
  @Input() isDisabled: boolean = false;

  constructor() {

    var canada = COUNTRIES_ADDRESS_LEGACY.filter(c => c.name.toLowerCase() == 'canada')[0];
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
    var selectedCountry = COUNTRIES_ADDRESS_LEGACY.filter(c => c.name.toLowerCase() == selection)[0];
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

    let selectedCountry = COUNTRIES_ADDRESS_LEGACY.filter(c => c.name.toLowerCase() == this.group['controls']['country'].value.toLowerCase())[0];
    if (selectedCountry !== undefined) {
      this.provinceList = selectedCountry.areas;
      this.provinceType = selectedCountry.areaType;
      this.postalCodeType = selectedCountry.postalCodeName;
      this.postalCodeSample = selectedCountry.postalCodeSample;
    }
  }
}