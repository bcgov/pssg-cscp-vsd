// import { Component, Input, Output, EventEmitter, forwardRef, OnInit } from '@angular/core';
// import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
// import { EmploymentIncomeInformation, Employer } from '../interfaces/application.interface';
// import { Address } from '../interfaces/address.interface';
// import { COUNTRIES_ADDRESS_2, iCountry } from '../shared/address/country-list';
// import { MatDatepickerInputEvent } from '@angular/material';
// import * as moment from 'moment';
// import { POSTAL_CODE } from '../shared/regex.constants';

// export class EiInfoForm implements EmploymentIncomeInformation {
//   wereYouEmployedAtTimeOfCrime: number; // 100000001==yes 100000000==no
//   wereYouAtWorkAtTimeOfIncident: number; // 100000001==yes 100000000==no
//   haveYouAppliedToWorkSafe: number; // 100000001==yes 100000000==no
//   wsbcClaimNumber: string;
//   didYouMissWorkDueToCrime: number; // 100000001==yes 100000000==no
//   didYouLoseWages: number; // 100000001==yes 100000000==no
//   areYouSelfEmployed: number; // 100000001==yes 100000000==no
//   mayContactEmployer: number; // 100000001==yes 100000000==no
//   haveYouAppliedForWorkersCompensation: number; // 100000001==yes 100000000==no
//   daysWorkMissedStart: Date;
//   daysWorkMissedEnd: Date;
//   areYouStillOffWork: number; // 100000001==yes 100000000==no
//   workersCompensationClaimNumber: string;
//   employers: EmployerForm[] = [];

//   constructor(eiInfo?: EmploymentIncomeInformation) {
//     if (eiInfo) {
//       this.wereYouEmployedAtTimeOfCrime = eiInfo.wereYouEmployedAtTimeOfCrime || null;
//       this.wereYouAtWorkAtTimeOfIncident = eiInfo.wereYouAtWorkAtTimeOfIncident || null;
//       this.haveYouAppliedToWorkSafe = eiInfo.haveYouAppliedForWorkersCompensation || null;
//       this.wsbcClaimNumber = eiInfo.workersCompensationClaimNumber || null;
//       this.didYouMissWorkDueToCrime = eiInfo.didYouMissWorkDueToCrime || null;
//       this.didYouLoseWages = eiInfo.didYouLoseWages || null;
//       this.areYouSelfEmployed = eiInfo.areYouSelfEmployed || null;
//       this.mayContactEmployer = eiInfo.mayContactEmployer || null;
//       this.haveYouAppliedForWorkersCompensation = eiInfo.haveYouAppliedForWorkersCompensation || null;
//       this.daysWorkMissedStart = eiInfo.daysWorkMissedStart || null;
//       this.daysWorkMissedEnd = eiInfo.daysWorkMissedEnd || null;
//       this.workersCompensationClaimNumber = eiInfo.workersCompensationClaimNumber || null;
//       eiInfo.employers.forEach(e => this.employers.push(new EmployerForm(e)));
//     } else {
//       // put a single blank element in arrays that can expand
//       this.employers.push(new EmployerForm());
//     }
//   }
// }
// class EmployerForm implements Employer {
//   employerName: string;
//   employerPhoneNumber: string;
//   employerFax: string;
//   employerEmail: string;
//   employerFirstName: string;
//   employerLastName: string;
//   employerAddress: AddressForm;
//   contactable: boolean;
//   constructor(employer?: Employer) {
//     if (employer) {
//       this.employerName = employer.employerName || null;
//       this.employerPhoneNumber = employer.employerPhoneNumber || null;
//       this.employerFax = employer.employerFax || null;
//       this.employerEmail = employer.employerEmail || null;
//       this.employerFirstName = employer.employerFirstName || null;
//       this.employerLastName = employer.employerLastName || null;
//       this.employerAddress = new AddressForm(employer.employerAddress);
//     } else {
//       // no object included in constructor argument make a new one
//       this.employerAddress = new AddressForm();
//     }
//   }
// }
// class AddressForm implements Address {
//   line1: string;
//   line2: string;
//   city: string;
//   postalCode: string;
//   province: string = 'British Columbia'; // made null so option can select default
//   country: string = 'Canada';
//   constructor(address?) {
//     if (address) {
//       this.line1 = address.line1 || null;
//       this.line2 = address.line2 || null;
//       this.city = address.city || null;
//       this.postalCode = address.postalCode || null;
//       this.province = address.province || null;
//       this.country = address.country || null;
//     }
//   }
// }
// const EMPLOYMENT_INCOME_PROVIDER = {
//   provide: NG_VALUE_ACCESSOR,
//   useExisting: forwardRef(() => EmploymentIncomeComponent),
//   multi: true
// };
// @Component({
//   selector: 'app-employment-income',
//   templateUrl: './employment-income.component.html',
//   styleUrls: ['./employment-income.component.scss'],
//   providers: [EMPLOYMENT_INCOME_PROVIDER]
// })
// export class EmploymentIncomeComponent implements ControlValueAccessor, OnInit {
//   @Input() value: EmploymentIncomeInformation;
//   @Output() valueChange = new EventEmitter<EmploymentIncomeInformation>();
//   @Output() employerAdded = new EventEmitter<EmploymentIncomeInformation>();
//   @Input() disabled = false; // TODO: disable the fields in the component when needed.

//   phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
//   postalRegex = POSTAL_CODE;
//   // handy expose keys for iteration
//   objectKeys = Object.keys;
//   countryList = COUNTRIES_ADDRESS_2;
//   showCurrentlyOffWork: boolean = false;
//   today = new Date();
//   minEndDate: Date;

//   constructor() {

//   }

//   eiInfo: EmploymentIncomeInformation;

//   ngOnInit() {
//     this.eiInfo = this.value;
//     if (this.eiInfo.daysWorkMissedStart) {
//       this.minEndDate = this.eiInfo.daysWorkMissedStart;
//     }
//     if (this.eiInfo.daysWorkMissedEnd) {
//       let endDate = moment(this.eiInfo.daysWorkMissedEnd);
//       this.showCurrentlyOffWork = endDate.isSame(new Date(), "day");
//       if (!this.showCurrentlyOffWork) {
//         this.eiInfo.areYouStillOffWork = null;
//       }
//     }
//   }

//   getCountryProperty(country: string, properyName: string): any {
//     if (!country) country = 'Canada';
//     if (!properyName) properyName = 'areaType';
//     // return 'Province' by default.
//     return this.countryList[country][properyName];
//   }
//   addEmployer() {
//     this.eiInfo.employers.push(new EmployerForm());
//     this.employerAdded.emit(this.eiInfo);
//     // this.valueChange.emit(this.eiInfo);
//   }
//   removeEmployer(i: number) {
//     // TODO: this is untested. If it isn't working right please fix or if it is please remove this comment
//     if (i === 0 && this.eiInfo.employers.length === 1) {
//       // first and only element in array. Just delete it and instantiate a new one
//       this.eiInfo.employers = [];
//       this.eiInfo.employers.push(new EmployerForm());
//     } else {
//       // chop out the one the user clicked
//       this.eiInfo.employers.splice(i, 1);
//     }
//   }

//   // validate(validationState: boolean) {
//   //   //TODO: remove all parts that may not fit the business logic. They could have changed their mind on a flag, added an answer so a blank element that shouldn't exist does exist.
//   //   if (validationState) {
//   //     // TODO: the validation state can emit when the user meets minimum requirements so this should be cleaned before sent back
//   //     this.propagateModelChange();
//   //   } else {
//   //     this.valueChange.emit(null);
//   //   }
//   // }
//   validate() {
//     this.valueChange.emit(this.eiInfo);
//   }

//   daysWorkMissedStartChange(event: MatDatepickerInputEvent<Date>) {
//     this.minEndDate = event.target.value;
//     //validate that a selected end date is not before the start date
//     let startDate = moment(event.target.value);
//     let endDate = moment(this.eiInfo.daysWorkMissedEnd);
//     if (endDate.isBefore(startDate)) {
//       this.eiInfo.daysWorkMissedEnd = null;
//     }
//     this.valueChange.emit(this.eiInfo);
//   }

//   daysWorkMissedEndChange(event: MatDatepickerInputEvent<Date>) {
//     let endDate = moment(event.target.value);
//     this.showCurrentlyOffWork = endDate.isSame(new Date(), "day");
//     if (!this.showCurrentlyOffWork) {
//       this.eiInfo.areYouStillOffWork = null;
//     }

//     //'this' context is currently the change event, wrapping it in a timeout gets us back to the component context, needed to trigger the valueChange
//     setTimeout(() => { this.valueChange.emit(this.eiInfo); }, 0);
//   }


//   /**********ControlValueAccessor interface needs these***********/
//   // This is a placeholder method that we use to emit changes back to the form.
//   onChange = (_: any) => { };
//   onTouched = () => { };
//   // This is a basic setter that the Angular forms API is going to use.
//   // This allows Angular to register a function to call when the model changes.
//   // This is how we emit the changes back to the form.
//   registerOnChange(fn: any): void { this.onChange = fn; }

//   registerOnTouched(fn: any): void { this.onTouched = fn; }

//   // This allows Angular to disable this component.
//   setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }
//   writeValue(val: EmploymentIncomeInformation): void {
//     // setter for the
//     this.eiInfo = new EiInfoForm(val);
//   }
//   propagateModelChange(touched = true): void {
//     // mark the form field as touched
//     if (touched) {
//       this.onTouched();
//     }

//     // emit changes
//     this.valueChange.emit(this.eiInfo);
//     this.onChange(this.eiInfo);
//   }

// }
