import { Subscription, Observable, Subject, forkJoin } from 'rxjs';
import { FormArray, ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { defaultFormat as _rollupMoment } from 'moment';
import { MatSnackBar } from '@angular/material';




import { Component, OnInit, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms'
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { COUNTRIES_ADDRESS } from './country-list';  // Make this live in here



@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
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
    let formField = this.group.controls[field];
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
