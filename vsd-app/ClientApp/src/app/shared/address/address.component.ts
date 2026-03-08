import { Component, inject, Input, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { noop, Observable, Observer, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { LookupService } from '../../../api/lookup/lookup.service';
import { config } from '../../../config';
import { CityLookupDto } from '../../../model/cityLookupDto';
import { CountryLookupDto } from '../../../model/countryLookupDto';
import { ProvinceLookupDto } from '../../../model/provinceLookupDto';
import { LookupStore } from '../../store/lookup.store';
import { POSTAL_CODE, ZIP_CODE } from '../regex.constants';
import { COUNTRIES_ADDRESS } from './country-list';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  standalone: false
})
export class AddressComponent implements OnInit {
  countryList: CountryLookupDto[] = config.preferred_countries;
  preferred_countries: CountryLookupDto[] = config.preferred_countries;
  postalRegex = POSTAL_CODE;
  zipRegex = ZIP_CODE;

  provinceList: ProvinceLookupDto[];
  provinceType: string;
  postalCodeType: string;
  postalCodeSample: string;

  cityList: CityLookupDto[] = [];
  search: string;
  suggestions$: Observable<CityLookupDto[]>;
  errorMessage: string;

  selectedCountry: CountryLookupDto;
  selectedProvince: ProvinceLookupDto;

  isProvinceDisabled: boolean = false;
  isCityDisabled: boolean = false;

  apiUrl = 'api/Lookup';

  protected readonly lookupStore = inject(LookupStore);

  @Input() group = UntypedFormGroup;
  @Input() showChildrenAsRequired: boolean = true;
  @Input() isDisabled: boolean = false;

  constructor(public lookupService: LookupService) {
    let canada = COUNTRIES_ADDRESS.filter((c) => c.name.toLowerCase() == 'canada')[0];
    this.provinceType = canada.areaType;
    this.postalCodeType = canada.postalCodeName;
    this.postalCodeSample = canada.postalCodeSample;
  }

  get headers() {
    return {};
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
          return this.lookupService
            .getApiLookupCitiesSearch({ country: countryVal, province: provinceVal, searchVal, limit: 15 })
            .pipe(
              map((data) => {
                if (data && data.cityCollection) {
                  data.cityCollection.sort((a, b) => a.name.localeCompare(b.name));
                  return data.cityCollection;
                } else return [];
              }),
              tap(
                () => noop,
                (err) => {
                  // in case of http error
                  this.errorMessage = (err && err.message) || 'Something goes wrong';
                }
              )
            );
        }
        return of([]);
      })
    );

    this.countryList = config.preferred_countries;
    this.provinceList = [];

    this.setupForm();
  }

  setupForm() {
    if (this.showChildrenAsRequired === undefined) {
      this.showChildrenAsRequired = true;
    }

    let pref_countries = this.lookupStore.countries().filter(
      (c) => config.preferred_countries.findIndex((pc) => pc.id == c.id) >= 0
    );
    let remaining_countries = this.lookupStore.countries().filter(
      (c) => config.preferred_countries.findIndex((pc) => pc.id == c.id) < 0
    );

    pref_countries.sort(function (a, b) {
      return (
        config.preferred_countries.findIndex((c) => c.id == a.id) -
        config.preferred_countries.findIndex((c) => c.id == b.id)
      );
    });
    if (!this.alreadyHasOtherOption(pref_countries) && !this.alreadyHasOtherOption(remaining_countries))
      pref_countries.unshift(config.other_country);

    remaining_countries.sort((a, b) => a.name.localeCompare(b.name));

    this.countryList = pref_countries.concat(remaining_countries);
    this.cityList = [...this.lookupStore.bcCities()];
    this.cityList.sort((a, b) => a.name.localeCompare(b.name));
    let other_city_index = this.getOtherIndex(this.cityList);
    if (other_city_index < 0) {
      this.cityList.unshift(config.other_city);
    } else {
      let other_city = this.cityList.splice(other_city_index, 1)[0];
      this.cityList.unshift(other_city);
    }

    let canada = COUNTRIES_ADDRESS.filter((c) => c.name.toLowerCase() == 'canada')[0];
    this.provinceType = canada.areaType;
    this.postalCodeType = canada.postalCodeName;
    this.postalCodeSample = canada.postalCodeSample;

    let countryVal = this.group['controls']['country'].value.toString();
    this.selectedCountry = this.lookupStore.countries().filter((c) => c.name.toLowerCase() == countryVal.toLowerCase())[0];
    if (countryVal === 'Other') this.selectedCountry = { name: 'Other', id: '123' };
    if (!this.selectedCountry) {
      this.selectedCountry = this.lookupStore.countries().filter((p) => p.name.toLowerCase() === 'canada')[0];
    }

    if (this.selectedCountry) {
      this.provinceList = this.lookupStore.provinces().filter((p) => p.countryId === this.selectedCountry.id);
      this.provinceList.sort((a, b) => a.name.localeCompare(b.name));
      let other_province_index = this.getOtherIndex(this.provinceList);
      if (other_province_index < 0) {
        this.provinceList.unshift(config.other_province);
      } else {
        let other_province = this.provinceList.splice(other_province_index, 1)[0];
        this.provinceList.unshift(other_province);
      }
    }

    if (this.selectedCountry) {
      this.setProvinceAndPostalType(this.selectedCountry.name);
    }

    let provinceVal = this.group['controls']['province'].value.toString();
    this.selectedProvince = this.lookupStore.provinces().filter(
      (c) => c.name.toLowerCase() == provinceVal.toLowerCase()
    )[0];
    if (this.selectedProvince.name != 'British Columbia') this.updateCityList();
    else this.setCityValidators();
    this.setProvinceValidators();
  }

  isSubFieldValid(field: string, disabled: boolean) {
    if (disabled === true) return true;
    let formField = this.group['controls'][field];
    if (formField == null) return true;

    return formField.valid || !formField.touched;
  }

  onCountryChange(event) {
    let provinceControl = this.group['controls']['province'] as UntypedFormControl;
    provinceControl.patchValue('');
    this.selectedProvince = { name: '', id: '', countryId: '', code: '' };
    let cityControl = this.group['controls']['city'] as UntypedFormControl;
    cityControl.patchValue('');

    let selection = event.target.value.toLowerCase();
    this.selectedCountry = this.lookupStore.countries().filter((c) => c.name.toLowerCase() == selection)[0];
    if (this.selectedCountry) {
      this.provinceList = this.lookupStore.provinces().filter((p) => p.countryId === this.selectedCountry.id);
      if (this.provinceList) {
        this.provinceList.sort((a, b) => a.name.localeCompare(b.name));
      }
      let other_province_index = this.getOtherIndex(this.provinceList);
      if (other_province_index < 0) {
        this.provinceList.unshift(config.other_province);
      } else {
        let other_province = this.provinceList.splice(other_province_index, 1)[0];
        this.provinceList.unshift(other_province);
      }

      provinceControl.patchValue('');
      this.setProvinceValidators();

      let postalControl = this.group['controls']['postalCode'] as UntypedFormControl;
      postalControl.patchValue('');

      this.setProvinceAndPostalType(this.selectedCountry.name);
      this.updateCityList();
    } else {
      this.provinceList = [config.other_province];
      this.setProvinceAndPostalType('');
      this.cityList = [config.other_city];
      this.setCityValidators();
    }
  }

  onProvinceChange(event) {
    let cityControl = this.group['controls']['city'] as UntypedFormControl;
    cityControl.patchValue('');
    let selection = event.target.value.toLowerCase();
    this.selectedProvince = this.lookupStore.provinces().filter((c) => c.name.toLowerCase() == selection)[0];
    this.updateCityList();
  }

  updateCityList() {
    if (this.selectedProvince && this.selectedCountry && this.selectedCountry.id && this.selectedProvince.id) {
      this.lookupService
        .getApiLookupCountryCountryIdProvinceProvinceIdCities(this.selectedCountry.id, this.selectedProvince.id)
        .subscribe((city_res) => {
          // console.log(city_res);
          if (city_res.value) {
            this.cityList = city_res.value;
            if (this.cityList) {
              this.cityList.sort((a, b) => a.name.localeCompare(b.name));
            }
            let other_city_index = this.getOtherIndex(this.cityList);
            if (other_city_index < 0) {
              this.cityList.unshift(config.other_city);
            } else {
              let other_city = this.cityList.splice(other_city_index, 1)[0];
              this.cityList.unshift(other_city);
            }
          } else {
            this.cityList = [config.other_city];
          }
          this.setCityValidators();
        });
    } else if (this.provinceList.length == 1 && this.selectedCountry && this.selectedCountry.id) {
      this.lookupService.getApiLookupCountryCountryIdCities(this.selectedCountry.id).subscribe((city_res) => {
        // console.log(city_res);
        if (city_res.value) {
          this.cityList = city_res.value;
          if (this.cityList) {
            this.cityList.sort((a, b) => a.name.localeCompare(b.name));
          }
          let other_city_index = this.getOtherIndex(this.cityList);
          if (other_city_index < 0) {
            this.cityList.unshift(config.other_city);
          } else {
            let other_city = this.cityList.splice(other_city_index, 1)[0];
            this.cityList.unshift(other_city);
          }
        } else {
          this.cityList = [config.other_city];
        }
        this.setCityValidators();
      });
    } else {
      this.cityList = [config.other_city];
      this.setCityValidators();
    }
  }

  setProvinceAndPostalType(country: string) {
    let postalControl = this.group['controls']['postalCode'] as UntypedFormControl;
    if (country.toLowerCase() === 'canada') {
      if (this.showChildrenAsRequired) {
        postalControl.setValidators([Validators.required, Validators.pattern(this.postalRegex)]);
      } else {
        postalControl.setValidators([Validators.pattern(this.postalRegex)]);
      }
      let canada = COUNTRIES_ADDRESS.filter((c) => c.name.toLowerCase() == 'canada')[0];
      this.provinceType = canada.areaType;
      this.postalCodeType = canada.postalCodeName;
      this.postalCodeSample = canada.postalCodeSample;
    } else if (country.toLowerCase() === 'united states of america') {
      postalControl.setValidators([Validators.pattern(this.zipRegex)]);
      let usa = COUNTRIES_ADDRESS.filter((c) => c.name.toLowerCase() == 'united states of america')[0];
      this.provinceType = usa.areaType;
      this.postalCodeType = usa.postalCodeName;
      this.postalCodeSample = usa.postalCodeSample;
    } else {
      postalControl.clearValidators();
      this.provinceType = 'Province/State';
      this.postalCodeType = 'Postal/ZIP Code';
      this.postalCodeSample = '';
    }
    postalControl.updateValueAndValidity();
  }

  setProvinceValidators() {
    let provinceControl = this.group['controls']['province'] as UntypedFormControl;
    if (this.provinceList.length == 0) {
      provinceControl.setErrors(null);
      provinceControl.disable();
      this.isProvinceDisabled = true;
    } else {
      provinceControl.enable();
      this.isProvinceDisabled = false;
    }
  }

  setCityValidators() {
    let provinceControl = this.group['controls']['province'] as UntypedFormControl;
    let cityControl = this.group['controls']['city'] as UntypedFormControl;

    if ((provinceControl.valid && this.cityList.length == 0) || provinceControl.disabled) {
      cityControl.setErrors(null);
      cityControl.disable();
      this.isCityDisabled = true;
    } else {
      cityControl.enable();
      this.isCityDisabled = false;
    }
  }

  alreadyHasOtherOption(list: any) {
    return list.findIndex((o) => o.name == 'Other') >= 0;
  }

  getOtherIndex(list: any) {
    return list.findIndex((o) => o.name == 'Other');
  }
}
