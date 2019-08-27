import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { EmploymentIncomeInformation, Employer } from '../interfaces/application.interface';
import { Address } from '../interfaces/address.interface';
import { COUNTRIES_ADDRESS } from '../shared/address/country-list';

class EiInfoForm implements EmploymentIncomeInformation {
  wereYouEmployedAtTimeOfCrime: number; // 100000001==yes 100000000==no
  wereYouAtWorkAtTimeOfIncident: number; // 100000001==yes 100000000==no
  didYouMissWorkDueToCrime: number; // 100000001==yes 100000000==no
  didYouLoseWages: number; // 100000001==yes 100000000==no
  areYouSelfEmployed: number; // 100000001==yes 100000000==no
  mayContactEmployer: number; // 100000001==yes 100000000==no
  haveYouAppliedForWorkersCompensation: number; // 100000001==yes 100000000==no
  daysWorkMissedStart: Date;
  daysWorkMissedEnd: Date;
  workersCompensationClaimNumber: string;
  employers: EmployerForm[] = [];
  constructor(eiInfo?: EmploymentIncomeInformation) {
    if (eiInfo) {
      this.wereYouEmployedAtTimeOfCrime = eiInfo.wereYouEmployedAtTimeOfCrime || null;
      this.wereYouAtWorkAtTimeOfIncident = eiInfo.wereYouAtWorkAtTimeOfIncident || null;
      this.didYouMissWorkDueToCrime = eiInfo.didYouMissWorkDueToCrime || null;
      this.didYouLoseWages = eiInfo.didYouLoseWages || null;
      this.areYouSelfEmployed = eiInfo.areYouSelfEmployed || null;
      this.mayContactEmployer = eiInfo.mayContactEmployer || null;
      this.haveYouAppliedForWorkersCompensation = eiInfo.haveYouAppliedForWorkersCompensation || null;
      this.daysWorkMissedStart = eiInfo.daysWorkMissedStart || null;
      this.daysWorkMissedEnd = eiInfo.daysWorkMissedEnd || null;
      this.workersCompensationClaimNumber = eiInfo.workersCompensationClaimNumber || null;
      eiInfo.employers.forEach(e => this.employers.push(new EmployerForm(e)));
    } else {
      // put a single blank element in arrays that can expand
      this.employers.push(new EmployerForm());
    }
  }
}
class EmployerForm implements Employer {
  employerName: string;
  employerPhoneNumber: string;
  employerFirstName: string;
  employerLastName: string;
  employerAddress: AddressForm;
  constructor(employer?: Employer) {
    if (employer) {
      this.employerName = employer.employerName || null;
      this.employerPhoneNumber = employer.employerPhoneNumber || null;
      this.employerFirstName = employer.employerFirstName || null;
      this.employerLastName = employer.employerLastName || null;
      this.employerAddress = new AddressForm(employer.employerAddress);
    } else {
      // no object included in constructor argument make a new one
      this.employerAddress = new AddressForm();
    }
  }
}
class AddressForm implements Address {
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  province: string;
  country: string;
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
  selector: 'app-employment-income',
  templateUrl: './employment-income.component.html',
  styleUrls: ['./employment-income.component.scss']
})
export class EmploymentIncomeComponent implements ControlValueAccessor {
  @Input() value: EmploymentIncomeInformation;
  @Output() valueChange = new EventEmitter<EmploymentIncomeInformation>();
  @Input() disabled = false; // TODO: disable the fields in the component when needed.

  phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  countryList = COUNTRIES_ADDRESS;
  constructor() {
    this.eiInfo = new EiInfoForm();
  }

  eiInfo: EmploymentIncomeInformation;

  addEmployer() {
    this.eiInfo.employers.push(new EmployerForm());
  }
  removeEmployer(i: number) {
    // TODO: this is untested. If it isn't working right please fix or if it is please remove this comment
    if (i === 0 && this.eiInfo.employers.length === 1) {
      // first and only element in array. Just delete it and instantiate a new one
      this.eiInfo.employers = [];
      this.eiInfo.employers.push(new EmployerForm());
    } else {
      // chop out the one the user clicked
      this.eiInfo.employers.splice(i, 1);
    }
  }

  validate(validationState: boolean) {
    //TODO: remove all parts that may not fit the business logic. (They changed their mind on a flag, added an answer so a blank element that shouldn't exist does exist. :-( ))
    // cleanFormData();
    // this is triggered when any form changes are made
    if (validationState) {
      this.propagateModelChange();
    }
  }
  /**********ControlValueAccessor interface needs these***********/
  // This is a placeholder method that we use to emit changes back to the form.
  onChange = (_: any) => { };
  onTouched = () => { };
  // This is a basic setter that the Angular forms API is going to use.
  // This allows Angular to register a function to call when the model changes.
  // This is how we emit the changes back to the form.
  registerOnChange(fn: any): void { this.onChange = fn; }

  registerOnTouched(fn: any): void { this.onTouched = fn; }

  // This allows Angular to disable this component.
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }
  writeValue(val: any): void {
    // setter for the
  }
  propagateModelChange(touched = true): void {
    // mark the form field as touched
    if (touched) {
      this.onTouched();
    }

    this.valueChange.emit(this.eiInfo)
  }

}
