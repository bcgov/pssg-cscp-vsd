import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, Validators, FormControl } from "@angular/forms";
import { COUNTRIES_ADDRESS } from './country-list';
import { POSTAL_CODE, ZIP_CODE } from '../regex.constants';
import { iCity, iCountry, iLookupData, iProvince } from '../../models/lookup-data.model';
import { config } from '../../../config';
import { LookupService } from '../../services/lookup.service';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html'
})
export class AddressComponent implements OnInit {
  countryList: iCountry[] = config.preferred_countries;
  preferred_countries: iCountry[] = config.preferred_countries;
  postalRegex = POSTAL_CODE;
  zipRegex = ZIP_CODE;

  provinceList: iProvince[];
  provinceType: string;
  postalCodeType: string;
  postalCodeSample: string;

  cityList: string[] = [];

  @Input() group = FormGroup;
  @Input() showChildrenAsRequired: boolean = true;
  @Input() isDisabled: boolean = false;
  @Input() lookupData: iLookupData;

  constructor(public lookupService: LookupService) {
    let canada = COUNTRIES_ADDRESS.filter(c => c.name.toLowerCase() == 'canada')[0];
    this.provinceType = canada.areaType;
    this.postalCodeType = canada.postalCodeName;
    this.postalCodeSample = canada.postalCodeSample;
  }

  ngOnInit() {
    this.countryList = config.preferred_countries;
    this.provinceList = [];

    let promise_array = [];
    if (!this.lookupData.countries) {
      promise_array.push(new Promise((resolve, reject) => {
        this.lookupService.getCountries().subscribe((res) => {
          this.lookupData.countries = res.value;
          this.lookupData.countries.sort(function (a, b) {
            return a.vsd_name.localeCompare(b.vsd_name);
          });
          resolve();
        });
      }));
    }

    if (!this.lookupData.provinces) {
      promise_array.push(new Promise((resolve, reject) => {
        this.lookupService.getProvinces().subscribe((res) => {
          this.lookupData.provinces = res.value;
          this.lookupData.provinces.sort(function (a, b) {
            return a.vsd_name.localeCompare(b.vsd_name);
          });
          resolve();
        });
      }));
    }

    if (!this.lookupData.cities) {
      promise_array.push(new Promise((resolve, reject) => {
        this.lookupService.getCitiesByProvince(config.canada_crm_id, config.bc_crm_id).subscribe((res) => {
          this.lookupData.cities = res.value;
          this.lookupData.cities.sort(function (a, b) {
            return a.vsd_name.localeCompare(b.vsd_name);
          });
          resolve();
        });
      }));
    }

    Promise.all(promise_array).then((res) => {
      this.setupForm();
    });
  }

  setupForm() {
    if (this.showChildrenAsRequired === undefined) {
      this.showChildrenAsRequired = true;
    }

    let pref_countries = this.lookupData.countries.filter(c => config.preferred_countries.findIndex(pc => pc.vsd_countryid == c.vsd_countryid) >= 0);
    let remaining_countries = this.lookupData.countries.filter(c => config.preferred_countries.findIndex(pc => pc.vsd_countryid == c.vsd_countryid) < 0);

    pref_countries.sort(function (a, b) {
      return config.preferred_countries.findIndex(c => c.vsd_countryid == a.vsd_countryid) - config.preferred_countries.findIndex(c => c.vsd_countryid == b.vsd_countryid);
    });

    remaining_countries.sort((a, b) => a.vsd_name.localeCompare(b.vsd_name));

    this.countryList = pref_countries.concat(remaining_countries);
    this.cityList = this.lookupData.cities.map(c => c.vsd_name);

    let canada = COUNTRIES_ADDRESS.filter(c => c.name.toLowerCase() == 'canada')[0];
    this.provinceType = canada.areaType;
    this.postalCodeType = canada.postalCodeName;
    this.postalCodeSample = canada.postalCodeSample;


    let countryVal = this.group['controls']['country'].value.toString();
    let selectedCountry = this.lookupData.countries.filter(c => c.vsd_name.toLowerCase() == countryVal.toLowerCase())[0];
    if (!selectedCountry) {
      selectedCountry = this.lookupData.countries.filter(p => p.vsd_name.toLowerCase() === 'canada')[0];
    }

    this.provinceList = this.lookupData.provinces.filter(p => p._vsd_countryid_value === selectedCountry.vsd_countryid);
    this.provinceList.sort((a, b) => a.vsd_name.localeCompare(b.vsd_name));
    let provinceVal = this.group['controls']['province'].value.toString();
    let selectedProvince = this.lookupData.provinces.filter(p => p.vsd_name.toLowerCase() == provinceVal.toLowerCase())[0];
    // console.log("cities for prov: ", selectedProvince ? selectedProvince.vsd_name : "no data");
    if (selectedProvince) {
      this.lookupService.getCitiesByProvince(selectedCountry.vsd_countryid, selectedProvince.vsd_provinceid).subscribe((res) => {
        let cities = res.value;
        cities.sort(function (a, b) {
          return a.vsd_name.localeCompare(b.vsd_name);
        });
        this.cityList = cities.map(c => c.vsd_name);
      });
    }

    this.setProvinceAndPostalType(selectedCountry.vsd_name);
    this.setProvinceValidators();


    if (this.cityList.length == 0) {
      // console.log("all cities");
      this.cityList = this.lookupData.cities.map(c => c.vsd_name);
    }
  }

  isSubFieldValid(field: string, disabled: boolean) {
    if (disabled === true) return true;
    let formField = this.group['controls'][field];
    if (formField == null)
      return true;

    return formField.valid || !formField.touched;
  }

  onCountryChange(event) {
    let selection = event.target.value.toLowerCase();
    let selectedCountry = this.lookupData.countries.filter(c => c.vsd_name.toLowerCase() == selection)[0];
    if (selectedCountry) {
      this.provinceList = this.lookupData.provinces.filter(p => p._vsd_countryid_value === selectedCountry.vsd_countryid);
      this.provinceList.sort((a, b) => a.vsd_name.localeCompare(b.vsd_name));

      let provinceControl = this.group['controls']['province'] as FormControl;
      provinceControl.patchValue('');
      this.setProvinceValidators();

      this.lookupService.getCitiesByCountry(selectedCountry.vsd_countryid).subscribe(res => {
        let cities = res.value;
        cities.sort(function (a, b) {
          return a.vsd_name.localeCompare(b.vsd_name);
        });
        this.cityList = cities.map(c => c.vsd_name);
      });

      let postalControl = this.group['controls']['postalCode'] as FormControl;
      postalControl.patchValue('');

      this.setProvinceAndPostalType(selectedCountry.vsd_name);
    }
    else {
      this.provinceList = [];
      this.cityList = this.lookupData.cities.map(c => c.vsd_name);
      this.setProvinceAndPostalType("");
    }

    if (this.cityList.length == 0) {
      // console.log("all cities");
      this.cityList = this.lookupData.cities.map(c => c.vsd_name);
    }
  }

  onProvinceChange(event) {
    let selection = event.target.value.toLowerCase();
    let selectedProvince = this.lookupData.provinces.filter(c => c.vsd_name.toLowerCase() == selection)[0];
    let countryVal = this.group['controls']['country'].value.toString();
    let selectedCountry = this.lookupData.countries.filter(c => c.vsd_name.toLowerCase() == countryVal.toLowerCase())[0];

    if (selectedProvince && selectedCountry) {
      this.lookupService.getCitiesByProvince(selectedCountry.vsd_countryid, selectedProvince.vsd_provinceid).subscribe((res) => {
        let cities = res.value;
        cities.sort(function (a, b) {
          return a.vsd_name.localeCompare(b.vsd_name);
        });
        this.cityList = cities.map(c => c.vsd_name);
      });
    }
    else if (selectedCountry) {
      this.lookupService.getCitiesByCountry(selectedCountry.vsd_countryid).subscribe(res => {
        let cities = res.value;
        cities.sort(function (a, b) {
          return a.vsd_name.localeCompare(b.vsd_name);
        });
        this.cityList = cities.map(c => c.vsd_name);
      });
    }
    else {
      this.cityList = this.lookupData.cities.map(c => c.vsd_name);
    }
  }

  setProvinceAndPostalType(country: string) {
    let postalControl = this.group['controls']['postalCode'] as FormControl;
    if (country.toLowerCase() === 'canada') {
      postalControl.setValidators([Validators.required, Validators.pattern(this.postalRegex)]);
      let canada = COUNTRIES_ADDRESS.filter(c => c.name.toLowerCase() == 'canada')[0];
      this.provinceType = canada.areaType;
      this.postalCodeType = canada.postalCodeName;
      this.postalCodeSample = canada.postalCodeSample;
    }
    else if (country.toLowerCase() === 'united states of america') {
      postalControl.setValidators([Validators.required, Validators.pattern(this.zipRegex)]);
      let usa = COUNTRIES_ADDRESS.filter(c => c.name.toLowerCase() == 'united states of america')[0];
      this.provinceType = usa.areaType;
      this.postalCodeType = usa.postalCodeName;
      this.postalCodeSample = usa.postalCodeSample;
    }
    else {
      postalControl.setValidators([Validators.required]);
      this.provinceType = "Province/State";
      this.postalCodeType = "Postal/ZIP Code";
      this.postalCodeSample = "";
    }
    postalControl.updateValueAndValidity();
  }

  setProvinceValidators() {
    let provinceControl = this.group['controls']['province'] as FormControl;

    if (this.provinceList.length > 0) {
      provinceControl.setValidators([Validators.required]);
      provinceControl.updateValueAndValidity();
    }
    else {
      provinceControl.clearValidators();
      provinceControl.updateValueAndValidity();
    }
  }
}
