import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, Validators, FormControl } from "@angular/forms";
import { COUNTRIES_ADDRESS } from './country-list';
import { POSTAL_CODE, ZIP_CODE } from '../regex.constants';
import { CitiesSearchResponse, iCity, iCountry, iLookupData, iProvince } from '../../interfaces/lookup-data.interface';
import { config } from '../../../config';
import { LookupService } from '../../services/lookup.service';
import { noop, Observable, Observer, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { retry, catchError, map, switchMap, tap } from 'rxjs/operators';

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

  cityList: iCity[] = [];
  search: string;
  suggestions$: Observable<iCity[]>;
  errorMessage: string;

  selectedCountry: iCountry;
  selectedProvince: iProvince;

  isProvinceDisabled: boolean = false;
  isCityDisabled: boolean = false;

  apiUrl = 'api/Lookup';

  @Input() group = FormGroup;
  @Input() showChildrenAsRequired: boolean = true;
  @Input() isDisabled: boolean = false;
  @Input() lookupData: iLookupData;

  constructor(public lookupService: LookupService,
    private http: HttpClient,) {
    let canada = COUNTRIES_ADDRESS.filter(c => c.name.toLowerCase() == 'canada')[0];
    this.provinceType = canada.areaType;
    this.postalCodeType = canada.postalCodeName;
    this.postalCodeSample = canada.postalCodeSample;
  }

  get headers(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }
  protected handleError(err): Observable<never> {
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = err.error.message;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}, body was: ${err.message}`;
    }
    return throwError(errorMessage);
  }

  ngOnInit() {
    //city search
    this.suggestions$ = new Observable((observer: Observer<string>) => {
      observer.next(this.group['controls']['city'].value.toString());
    }).pipe(
      switchMap((query: string) => {
        if (query) {
          let countryVal = this.group['controls']['country'].value.toString();
          let provinceVal = this.group['controls']['province'].value.toString();
          let searchVal = this.group['controls']['city'].value.toString();
          return this.lookupService.searchCities(countryVal, provinceVal, searchVal).pipe(
            map((data: CitiesSearchResponse) => {
              if (data && data.CityCollection) {
                data.CityCollection.sort((a, b) => a.vsd_name.localeCompare(b.vsd_name));
                return data.CityCollection;
              }
              else return [];
            }),
            tap(() => noop, err => {
              // in case of http error
              this.errorMessage = err && err.message || 'Something goes wrong';
            })
          );
        }
        return of([]);
      })
    );

    this.countryList = config.preferred_countries;
    this.provinceList = [];

    let promise_array = [];
    if (!this.lookupData.countries || this.lookupData.countries.length == 0) {
      promise_array.push(new Promise<void>((resolve, reject) => {
        this.lookupService.getCountries().subscribe((res) => {
          this.lookupData.countries = res.value;
          if (this.lookupData.countries) {
            this.lookupData.countries.sort(function (a, b) {
              return a.vsd_name.localeCompare(b.vsd_name);
            });
          }
          resolve();
        });
      }));
    }

    if (!this.lookupData.provinces || this.lookupData.provinces.length == 0) {
      promise_array.push(new Promise<void>((resolve, reject) => {
        this.lookupService.getProvinces().subscribe((res) => {
          this.lookupData.provinces = res.value;
          if (this.lookupData.provinces) {
            this.lookupData.provinces.sort(function (a, b) {
              return a.vsd_name.localeCompare(b.vsd_name);
            });
          }
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
    if (!this.alreadyHasOtherOption(pref_countries) && !this.alreadyHasOtherOption(remaining_countries)) pref_countries.unshift(config.other_country);

    remaining_countries.sort((a, b) => a.vsd_name.localeCompare(b.vsd_name));

    this.countryList = pref_countries.concat(remaining_countries);
    this.cityList = this.lookupData.cities;
    this.cityList.sort((a, b) => a.vsd_name.localeCompare(b.vsd_name));
    let other_city_index = this.getOtherIndex(this.cityList)
    if (other_city_index < 0) {
      this.cityList.unshift(config.other_city);
    }
    else {
      let other_city = this.cityList.splice(other_city_index, 1)[0];
      this.cityList.unshift(other_city);
    }

    let canada = COUNTRIES_ADDRESS.filter(c => c.name.toLowerCase() == 'canada')[0];
    this.provinceType = canada.areaType;
    this.postalCodeType = canada.postalCodeName;
    this.postalCodeSample = canada.postalCodeSample;

    let countryVal = this.group['controls']['country'].value.toString();
    this.selectedCountry = this.lookupData.countries.filter(c => c.vsd_name.toLowerCase() == countryVal.toLowerCase())[0];
    if (countryVal === "Other") this.selectedCountry = { vsd_name: "Other", vsd_countryid: "123" };
    if (!this.selectedCountry) {
      this.selectedCountry = this.lookupData.countries.filter(p => p.vsd_name.toLowerCase() === 'canada')[0];
    }

    if (this.selectedCountry) {
      this.provinceList = this.lookupData.provinces.filter(p => p._vsd_countryid_value === this.selectedCountry.vsd_countryid);
      this.provinceList.sort((a, b) => a.vsd_name.localeCompare(b.vsd_name));
      let other_province_index = this.getOtherIndex(this.provinceList)
      if (other_province_index < 0) {
        this.provinceList.unshift(config.other_province);
      }
      else {
        let other_province = this.provinceList.splice(other_province_index, 1)[0];
        this.provinceList.unshift(other_province);
      }
    }

    if (this.selectedCountry) {
      this.setProvinceAndPostalType(this.selectedCountry.vsd_name);
    }

    let provinceVal = this.group['controls']['province'].value.toString();
    this.selectedProvince = this.lookupData.provinces.filter(c => c.vsd_name.toLowerCase() == provinceVal.toLowerCase())[0];
    if (this.selectedProvince.vsd_name != "British Columbia")
      this.updateCityList();
    else
      this.setCityValidators();
    this.setProvinceValidators();
  }

  isSubFieldValid(field: string, disabled: boolean) {
    if (disabled === true) return true;
    let formField = this.group['controls'][field];
    if (formField == null)
      return true;

    return formField.valid || !formField.touched;
  }

  onCountryChange(event) {
    let provinceControl = this.group['controls']['province'] as FormControl;
    provinceControl.patchValue('');
    this.selectedProvince = { vsd_name: "", _vsd_countryid_value: "", vsd_code: "", vsd_provinceid: "" };
    let cityControl = this.group['controls']['city'] as FormControl;
    cityControl.patchValue('');

    let selection = event.target.value.toLowerCase();
    this.selectedCountry = this.lookupData.countries.filter(c => c.vsd_name.toLowerCase() == selection)[0];
    if (this.selectedCountry) {
      this.provinceList = this.lookupData.provinces.filter(p => p._vsd_countryid_value === this.selectedCountry.vsd_countryid);
      if (this.provinceList) {
        this.provinceList.sort((a, b) => a.vsd_name.localeCompare(b.vsd_name));
      }
      let other_province_index = this.getOtherIndex(this.provinceList)
      if (other_province_index < 0) {
        this.provinceList.unshift(config.other_province);
      }
      else {
        let other_province = this.provinceList.splice(other_province_index, 1)[0];
        this.provinceList.unshift(other_province);
      }

      provinceControl.patchValue('');
      this.setProvinceValidators();

      let postalControl = this.group['controls']['postalCode'] as FormControl;
      postalControl.patchValue('');

      this.setProvinceAndPostalType(this.selectedCountry.vsd_name);
      this.updateCityList();
    }
    else {
      this.provinceList = [config.other_province];
      this.setProvinceAndPostalType("");
      this.cityList = [config.other_city];
      this.setCityValidators();
    }
  }

  onProvinceChange(event) {
    let cityControl = this.group['controls']['city'] as FormControl;
    cityControl.patchValue('');
    let selection = event.target.value.toLowerCase();
    this.selectedProvince = this.lookupData.provinces.filter(c => c.vsd_name.toLowerCase() == selection)[0];
    this.updateCityList();
  }

  updateCityList() {
    if (this.selectedProvince && this.selectedCountry && this.selectedCountry.vsd_countryid && this.selectedProvince.vsd_provinceid) {
      this.lookupService.getCitiesByProvince(this.selectedCountry.vsd_countryid, this.selectedProvince.vsd_provinceid).subscribe((city_res) => {
        // console.log(city_res);
        if (city_res.value) {
          this.cityList = city_res.value;
          if (this.cityList) {
            this.cityList.sort((a, b) => a.vsd_name.localeCompare(b.vsd_name));
          }
          let other_city_index = this.getOtherIndex(this.cityList)
          if (other_city_index < 0) {
            this.cityList.unshift(config.other_city);
          }
          else {
            let other_city = this.cityList.splice(other_city_index, 1)[0];
            this.cityList.unshift(other_city);
          }
        }
        else {
          this.cityList = [config.other_city];
        }
        this.setCityValidators();
      });
    }
    else if (this.provinceList.length == 1 && this.selectedCountry && this.selectedCountry.vsd_countryid) {
      this.lookupService.getCitiesByCountry(this.selectedCountry.vsd_countryid).subscribe((city_res) => {
        // console.log(city_res);
        if (city_res.value) {
          this.cityList = city_res.value;
          if (this.cityList) {
            this.cityList.sort((a, b) => a.vsd_name.localeCompare(b.vsd_name));
          }
          let other_city_index = this.getOtherIndex(this.cityList)
          if (other_city_index < 0) {
            this.cityList.unshift(config.other_city);
          }
          else {
            let other_city = this.cityList.splice(other_city_index, 1)[0];
            this.cityList.unshift(other_city);
          }
        }
        else {
          this.cityList = [config.other_city];
        }
        this.setCityValidators();
      });
    }
    else {
      this.cityList = [config.other_city];
      this.setCityValidators();
    }
  }

  setProvinceAndPostalType(country: string) {
    let postalControl = this.group['controls']['postalCode'] as FormControl;
    if (country.toLowerCase() === 'canada') {
      if (this.showChildrenAsRequired) {
        postalControl.setValidators([Validators.required, Validators.pattern(this.postalRegex)]);
      }
      else {
        postalControl.setValidators([Validators.pattern(this.postalRegex)]);
      }
      let canada = COUNTRIES_ADDRESS.filter(c => c.name.toLowerCase() == 'canada')[0];
      this.provinceType = canada.areaType;
      this.postalCodeType = canada.postalCodeName;
      this.postalCodeSample = canada.postalCodeSample;
    }
    else if (country.toLowerCase() === 'united states of america') {
      postalControl.setValidators([Validators.pattern(this.zipRegex)]);
      let usa = COUNTRIES_ADDRESS.filter(c => c.name.toLowerCase() == 'united states of america')[0];
      this.provinceType = usa.areaType;
      this.postalCodeType = usa.postalCodeName;
      this.postalCodeSample = usa.postalCodeSample;
    }
    else {
      postalControl.clearValidators();
      this.provinceType = "Province/State";
      this.postalCodeType = "Postal/ZIP Code";
      this.postalCodeSample = "";
    }
    postalControl.updateValueAndValidity();
  }

  setProvinceValidators() {
    let provinceControl = this.group['controls']['province'] as FormControl;
    if (this.provinceList.length == 0) {
      provinceControl.setErrors(null);
      provinceControl.disable();
      this.isProvinceDisabled = true;
    }
    else {
      provinceControl.enable();
      this.isProvinceDisabled = false;
    }
  }

  setCityValidators() {
    let provinceControl = this.group['controls']['province'] as FormControl;
    let cityControl = this.group['controls']['city'] as FormControl;

    if ((provinceControl.valid && this.cityList.length == 0) || provinceControl.disabled) {
      cityControl.setErrors(null);
      cityControl.disable();
      this.isCityDisabled = true;
    }
    else {
      cityControl.enable();
      this.isCityDisabled = false;
    }
  }

  alreadyHasOtherOption(list: any) {
    return list.findIndex(o => o.vsd_name == "Other") >= 0;
  }

  getOtherIndex(list: any) {
    return list.findIndex(o => o.vsd_name == "Other");
  }
}