import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { EmploymentIncomeInformation, Employer } from '../interfaces/application.interface';
import { Address } from '../interfaces/address.interface';

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
  employers: EmployerForm[];
}
class EmployerForm implements Employer {
  employerName: string;
  employerPhoneNumber: string;
  employerFirstName: string;
  employerLastName: string;
  employerAddress: AddressForm;
}
class AddressForm implements Address {
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  province: string;
  country: string;
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

  constructor() {
    this.eiInfo = new EiInfoForm();
  }

  eiInfo: EmploymentIncomeInformation;

  validate(validationState: boolean) {
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
