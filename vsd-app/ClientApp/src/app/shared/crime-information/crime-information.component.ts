import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import {
  ControlContainer,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { LookupStore } from '../../store/lookup.store';
import { SignPadDialog } from '../../sign-dialog/sign-dialog.component';
import { AddressHelper } from '../address/address.helper';
import { ApplicationType, CRMBoolean, CRMMultiBoolean, MY_FORMATS } from '../enums-list';
import { FormBase } from '../form-base';
import { CrimeInfoHelper } from './crime-information.helper';

@Component({
  selector: 'app-crime-information',
  templateUrl: './crime-information.component.html',
  styleUrls: ['./crime-information.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ],
  standalone: false
})
export class CrimeInformationComponent extends FormBase implements OnInit, OnDestroy {
  @Input() formType: number;
  protected readonly lookupStore = inject(LookupStore);
  public form: UntypedFormGroup;
  CRMBoolean = CRMBoolean;
  CRMMultiBoolean = CRMMultiBoolean;
  crimeLocationItems: UntypedFormArray;
  showAddCrimeLocation: boolean = true;
  showRemoveCrimeLocation: boolean = false;
  showCrimeDateWarning: boolean = false;

  unsureOfCrimeDateSubscription: Subscription;
  wasReportMadeToPoliceSubscription: Subscription;
  applyToCourtForMoneyFromOffenderSubscription: Subscription;
  willBeTakingLegalActionSubscription: Subscription;
  offenderBeenChargedSubscription: Subscription;
  haveYouSuedOffenderSubscription: Subscription;
  intendToSueOffenderSubscription: Subscription;

  applyToCourtForMoneyFromOffender: UntypedFormControl;
  willBeTakingLegalAction: UntypedFormControl;
  signName: UntypedFormControl;
  signature: UntypedFormControl;
  thisCourtFileLocation: UntypedFormControl;

  CourtFileGroup: UntypedFormGroup;

  courtLocationItems: UntypedFormArray;
  policeReportItems: UntypedFormArray;

  showAddPoliceReport: boolean = true;
  showRemovePoliceReport: boolean = false;
  showAddMoreOffenders: boolean = false;

  courtFileItems: UntypedFormArray;
  showAddCourtInfo: boolean = true;
  showRemoveCourtInfo: boolean = false;

  todaysDate = new Date();

  ApplicationType = ApplicationType;

  today = new Date();
  oneYearAgo = moment(new Date()).subtract(1, 'year');
  policeReportMinDates: Date[] = [];

  crimePeriodStartDate: Date = null;
  showWhyDidYouNotApplySooner: boolean = false;
  crimeInfoHelper = new CrimeInfoHelper();

  cityList: string[] = [];
  policeForceList: string[] = [];
  courtList: string[] = [];
  crimeInjuriesLabel: string =
    'Please specify any injuries, physical or psychological, you sustained as a result of the crime (e.g. bruised leg, broken wrist, sleeplessness). (Maximum 750 characters)';
  addressHelper = new AddressHelper();

  constructor(
    private controlContainer: ControlContainer,
    private matDialog: MatDialog,
    private fb: UntypedFormBuilder
  ) {
    super();
  }

  ngOnInit() {
    this.form = <UntypedFormGroup>this.controlContainer.control;
    setTimeout(() => {
      this.form.markAsTouched();
    }, 0);

    // console.log("crime info component");
    // console.log(this.form);
    this.policeReportItems = this.form.get('policeReports') as UntypedFormArray;
    this.showRemovePoliceReport = this.policeReportItems.length > 1;

    if (this.formType === ApplicationType.IFM_Application) {
      this.crimeInjuriesLabel =
        'Please specify any psychological injuries you sustained as a result of the crime (e.g. anxiety, sleeplessness)';
    }

    for (let i = 0; i < this.policeReportItems.length; ++i) {
      let thisReport = this.policeReportItems.at(i) as UntypedFormGroup;
      this.policeReportMinDates.push(thisReport.get('reportStartDate').value);
    }

    let startDate = this.form.get('crimePeriodStart').value;
    this.showWhyDidYouNotApplySooner = moment(startDate).isBefore(this.oneYearAgo);
    let birthdate = this.form.parent.get('personalInformation.birthDate').value;
    if (birthdate && moment(birthdate).isAfter(startDate)) {
      this.showCrimeDateWarning = true;
    } else {
      this.showCrimeDateWarning = false;
    }

    this.courtFileItems = this.form.get('courtFiles') as UntypedFormArray;
    this.showRemoveCourtInfo = this.courtFileItems.length > 1;

    this.wasReportMadeToPoliceSubscription = this.form.get('wasReportMadeToPolice').valueChanges.subscribe((value) => {
      let noPoliceReportIdentification = this.form.get('noPoliceReportIdentification');
      if (value === CRMMultiBoolean.True) {
        this.addPoliceReport();
        noPoliceReportIdentification.clearValidators();
        noPoliceReportIdentification.setErrors(null);
        noPoliceReportIdentification.setValue('');
      } else {
        this.removeAllPoliceReports();

        noPoliceReportIdentification.setValidators([Validators.required]);
      }

      noPoliceReportIdentification.updateValueAndValidity();
    });

    this.applyToCourtForMoneyFromOffenderSubscription = this.form
      .get('racafInformation.applyToCourtForMoneyFromOffender')
      .valueChanges.subscribe((value) => {
        if (value === CRMMultiBoolean.True) {
          this.applyToCourtOrLegalYes();
        } else {
          this.applyToCourtNo();
        }
      });

    this.willBeTakingLegalActionSubscription = this.form
      .get('racafInformation.willBeTakingLegalAction')
      .valueChanges.subscribe((value) => {
        if (value === CRMMultiBoolean.True) {
          this.applyToCourtOrLegalYes();
        } else {
          let doYouHaveALawyerControl = this.form.get('racafInformation.haveLawyer');
          doYouHaveALawyerControl.patchValue('');
          this.haveLawyerChange(false);
          this.legalChangesNo();
        }
      });

    this.offenderBeenChargedSubscription = this.form.get('offenderBeenCharged').valueChanges.subscribe((value) => {
      if (value === CRMMultiBoolean.True) {
        // Yes
        this.offenderBeenChargedYes();
      } else {
        // No or Unknown
        this.offenderBeenChargedNo();
      }
    });

    this.haveYouSuedOffenderSubscription = this.form.get('haveYouSuedOffender').valueChanges.subscribe((value) => {
      if (value === CRMBoolean.True) {
        let intendToSue = this.form.get('intendToSueOffender');
        this.clearControlValidators(intendToSue);
        intendToSue.patchValue('');
        this.suedOrIntendToSueYes();
      } else if (value === CRMBoolean.False) {
        this.suedNo();
      }
    });

    this.intendToSueOffenderSubscription = this.form.get('intendToSueOffender').valueChanges.subscribe((value) => {
      if (value === CRMMultiBoolean.True || value === CRMMultiBoolean.Undecided) {
        this.suedOrIntendToSueYes();
      } else if (value === CRMMultiBoolean.False) {
        this.intendToSueNo();
      }
    });

    this.courtList = this.lookupStore.courts().map((c) => c.name);

    this.policeForceList = this.lookupStore.policeDetachments().map((pd) => pd.name);

    this.cityList = this.lookupStore.bcCities().map((c) => c.name);
  }

  ngOnDestroy() {
    if (this.wasReportMadeToPoliceSubscription) this.wasReportMadeToPoliceSubscription.unsubscribe();
    if (this.applyToCourtForMoneyFromOffenderSubscription)
      this.applyToCourtForMoneyFromOffenderSubscription.unsubscribe();
    if (this.willBeTakingLegalActionSubscription) this.willBeTakingLegalActionSubscription.unsubscribe();
    if (this.haveYouSuedOffenderSubscription) this.haveYouSuedOffenderSubscription.unsubscribe();
    if (this.intendToSueOffenderSubscription) this.intendToSueOffenderSubscription.unsubscribe();
    if (this.offenderBeenChargedSubscription) this.offenderBeenChargedSubscription.unsubscribe();
  }

  addCrimeLocation(): void {
    this.crimeLocationItems = this.form.get('crimeLocations') as UntypedFormArray;
    this.crimeLocationItems.push(this.crimeInfoHelper.createCrimeLocationItem(this.fb));
    this.showAddCrimeLocation = this.crimeLocationItems.length < 5;
    this.showRemoveCrimeLocation = this.crimeLocationItems.length > 1;
  }

  removeCrimeLocation(index: number): void {
    this.crimeLocationItems = this.form.get('crimeLocations') as UntypedFormArray;
    this.crimeLocationItems.removeAt(index);
    this.showAddCrimeLocation = this.crimeLocationItems.length < 5;
    this.showRemoveCrimeLocation = this.crimeLocationItems.length > 1;
  }

  addPoliceReport(): void {
    this.policeReportItems = this.form.get('policeReports') as UntypedFormArray;
    this.policeReportItems.push(this.crimeInfoHelper.createPoliceReport(this.fb));
    this.showAddPoliceReport = this.policeReportItems.length < 5;
    this.showRemovePoliceReport = this.policeReportItems.length > 1;

    this.policeReportMinDates.push(null);
  }

  removePoliceReport(index: number): void {
    this.policeReportItems = this.form.get('policeReports') as UntypedFormArray;
    this.policeReportItems.removeAt(index);
    this.showAddPoliceReport = this.policeReportItems.length < 5;
    this.showRemovePoliceReport = this.policeReportItems.length > 1;
    this.policeReportMinDates.splice(index, 1);
  }

  removeAllPoliceReports() {
    this.policeReportItems = this.form.get('policeReports') as UntypedFormArray;
    while (this.policeReportItems.length !== 0) {
      this.policeReportItems.removeAt(0);
    }
    this.policeReportMinDates = [];
  }

  offenderBeenChargedYes(): void {
    this.courtLocationItems = this.form.get('courtFiles') as UntypedFormArray;
    if (this.courtLocationItems.length == 0) {
      this.addCourtInfo();
    }

    for (let i = 0; i < this.courtLocationItems.length; ++i) {
      this.CourtFileGroup = this.courtLocationItems.controls[i] as UntypedFormGroup;
      this.thisCourtFileLocation = this.CourtFileGroup.controls['courtLocation'] as UntypedFormControl;
      this.setControlValidators(this.thisCourtFileLocation, [Validators.required]);
    }
  }

  offenderBeenChargedNo(): void {
    this.courtLocationItems = this.form.get('courtFiles') as UntypedFormArray;
    while (this.courtLocationItems.length !== 0) {
      this.courtLocationItems.removeAt(0);
    }
  }

  applyToCourtOrLegalYes(): void {
    this.signName = this.form.get('racafInformation.signName') as UntypedFormControl;
    this.signature = this.form.get('racafInformation.signature') as UntypedFormControl;
    this.setControlValidators(this.signName, [Validators.required]);
    this.setControlValidators(this.signature, [Validators.required]);
  }

  applyToCourtNo(): void {
    let willBeTakingLegal = this.form.get('racafInformation.willBeTakingLegalAction').value;
    this.signName = this.form.get('racafInformation.signName') as UntypedFormControl;
    this.signature = this.form.get('racafInformation.signature') as UntypedFormControl;
    if (willBeTakingLegal === 100000000) {
      this.setControlValidators(this.signName, [Validators.required]);
      this.setControlValidators(this.signature, [Validators.required]);
    } else {
      this.signName.patchValue('');
      this.signature.patchValue('');
      this.clearControlValidators(this.signName);
      this.clearControlValidators(this.signature);
    }
  }

  legalChangesNo(): void {
    let applyToCourt = this.form.get('racafInformation.applyToCourtForMoneyFromOffender').value;
    this.signature = this.form.get('racafInformation.signature') as UntypedFormControl;
    this.signName = this.form.get('racafInformation.signName') as UntypedFormControl;
    if (applyToCourt === 100000000) {
      this.setControlValidators(this.signName, [Validators.required]);
      this.setControlValidators(this.signature, [Validators.required]);
    } else {
      this.signName.patchValue('');
      this.signature.patchValue('');
      this.clearControlValidators(this.signName);
      this.clearControlValidators(this.signature);
    }
  }

  haveLawyerChange(val: boolean) {
    if (!val) {
      this.form.get('racafInformation.lawyerOrFirmName').patchValue('');
      this.addressHelper.clearAddress(this.form, 'racafInformation.lawyerAddress');
    }
  }

  suedOrIntendToSueYes(): void {
    this.willBeTakingLegalAction = this.form.get('racafInformation.willBeTakingLegalAction') as UntypedFormControl;
    this.applyToCourtForMoneyFromOffender = this.form.get(
      'racafInformation.applyToCourtForMoneyFromOffender'
    ) as UntypedFormControl;
    this.setControlValidators(this.willBeTakingLegalAction, [Validators.required]);
    this.setControlValidators(this.applyToCourtForMoneyFromOffender, [Validators.required]);
  }

  suedNo(): void {
    let intendToSue = this.form.get('intendToSueOffender') as UntypedFormControl;
    this.setControlValidators(intendToSue, [Validators.required]);
    this.willBeTakingLegalAction = this.form.get('racafInformation.willBeTakingLegalAction') as UntypedFormControl;
    this.applyToCourtForMoneyFromOffender = this.form.get(
      'racafInformation.applyToCourtForMoneyFromOffender'
    ) as UntypedFormControl;
    if (intendToSue.value === CRMMultiBoolean.True || intendToSue.value === CRMMultiBoolean.Undecided) {
      this.setControlValidators(this.willBeTakingLegalAction, [Validators.required]);
      this.setControlValidators(this.applyToCourtForMoneyFromOffender, [Validators.required]);
    } else {
      this.clearControlValidators(this.willBeTakingLegalAction);
      this.clearControlValidators(this.applyToCourtForMoneyFromOffender);
      this.willBeTakingLegalAction.patchValue('');
      this.applyToCourtForMoneyFromOffender.patchValue('');

      this.applyToCourtNo();
      this.applyToCourtForMoneyFromOffenderChange();
      let doYouHaveALawyerControl = this.form.get('racafInformation.haveLawyer');
      doYouHaveALawyerControl.patchValue('');
      this.haveLawyerChange(false);
      //clear expenses inf
      //clear do you have a lawyer
    }
  }

  intendToSueNo(): void {
    this.willBeTakingLegalAction = this.form.get('racafInformation.willBeTakingLegalAction') as UntypedFormControl;
    this.applyToCourtForMoneyFromOffender = this.form.get(
      'racafInformation.applyToCourtForMoneyFromOffender'
    ) as UntypedFormControl;
    this.clearControlValidators(this.willBeTakingLegalAction);
    this.clearControlValidators(this.applyToCourtForMoneyFromOffender);
    this.willBeTakingLegalAction.patchValue('');
    this.applyToCourtForMoneyFromOffender.patchValue('');
  }

  addCourtInfo(): void {
    this.courtFileItems = this.form.get('courtFiles') as UntypedFormArray;
    this.courtFileItems.push(this.crimeInfoHelper.createCourtInfoItem(this.fb));
    this.showAddCourtInfo = this.courtFileItems.length < 3;
    this.showRemoveCourtInfo = this.courtFileItems.length > 1;
  }

  removeCourtInfo(index: number): void {
    this.courtFileItems = this.form.get('courtFiles') as UntypedFormArray;
    this.courtFileItems.removeAt(index);
    this.showAddCourtInfo = this.courtFileItems.length < 3;
    this.showRemoveCourtInfo = this.courtFileItems.length > 1;
  }

  showSignPad(group, control): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.matDialog.open(SignPadDialog, dialogConfig);
    dialogRef.afterClosed().subscribe(
      (data) => {
        var patchObject = {};
        patchObject[control] = data;
        this.form.get(group).patchValue(patchObject);
      },
      (err) => console.log(err)
    );
  }

  crimePeriodStartChange() {
    this.crimePeriodStartDate = moment(this.form.get('crimePeriodStart').value).toDate();

    //validate that a selected end date is not before the start date
    let startDate = moment(this.form.get('crimePeriodStart').value);

    let endDate = this.form.get('crimePeriodEnd').value;
    if (endDate && moment(endDate).isBefore(startDate)) {
      this.form.get('crimePeriodEnd').patchValue(null);
      endDate = null;
    }

    this.validateCrimePeriodWithinOneYear();

    this.form
      .get('overOneYearFromCrime')
      .patchValue(this.showWhyDidYouNotApplySooner ? CRMBoolean.True : CRMBoolean.False);

    let birthdate = this.form.parent.get('personalInformation.birthDate').value;
    if (birthdate && moment(birthdate).isAfter(startDate)) {
      this.showCrimeDateWarning = true;
    } else {
      this.showCrimeDateWarning = false;
    }
  }

  validateCrimePeriodWithinOneYear() {
    let startDate = moment(this.form.get('crimePeriodStart').value);
    let endDate = this.form.get('crimePeriodEnd').value;

    let crimePeriodEndDate = startDate;
    if (endDate) {
      crimePeriodEndDate = endDate;
    } else if (
      this.form.get('whenDidCrimeOccur').value === true ||
      this.form.get('unsureOfCrimeDates').value === true
    ) {
      crimePeriodEndDate = null;
    }

    if (crimePeriodEndDate) {
      this.showWhyDidYouNotApplySooner = moment(crimePeriodEndDate).isBefore(this.oneYearAgo);
    } else {
      this.showWhyDidYouNotApplySooner = false;
    }
  }

  whenDidCrimeOccurChange(event) {
    let crimePeriodEndControl = this.form.get('crimePeriodEnd');
    let unsureOfCrimeDatesControl = this.form.get('unsureOfCrimeDates');

    if (this.form.get('whenDidCrimeOccur').value) {
      this.setControlValidators(crimePeriodEndControl, [Validators.required]);
    } else if (!unsureOfCrimeDatesControl.value) {
      crimePeriodEndControl.patchValue(null);
      this.clearControlValidators(crimePeriodEndControl);
    }

    this.validateCrimePeriodWithinOneYear();
  }

  unsureOfCrimeDateChange(event) {
    let unsureOfCrimeDatesControl = this.form.get('unsureOfCrimeDates');
    let crimePeriodEndControl = this.form.get('crimePeriodEnd');
    let whenDidCrimeOccurControl = this.form.get('whenDidCrimeOccur');
    if (unsureOfCrimeDatesControl.value) {
      this.setControlValidators(crimePeriodEndControl, [Validators.required]);
    } else if (!whenDidCrimeOccurControl.value) {
      crimePeriodEndControl.patchValue(null);
      this.clearControlValidators(crimePeriodEndControl);
    }

    this.validateCrimePeriodWithinOneYear();
  }

  reportStartChange(index: number) {
    this.policeReportItems = this.form.get('policeReports') as UntypedFormArray;
    let thisReport = this.policeReportItems.at(index) as UntypedFormGroup;
    let endDate = moment(thisReport.get('reportEndDate').value);

    this.policeReportMinDates[index] = thisReport.get('reportStartDate').value;
    //validate that a selected end date is not before the start date
    let startDate = moment(thisReport.get('reportStartDate').value);

    if (endDate.isBefore(startDate)) {
      thisReport.get('reportEndDate').patchValue('');
    }
  }

  clearReportEndDate(index: number) {
    this.policeReportItems = this.form.get('policeReports') as UntypedFormArray;
    let thisReport = this.policeReportItems.at(index) as UntypedFormGroup;
    let thisEndDateControl = thisReport.get('reportEndDate');

    if (thisReport.get('policeReportedMultipleTimes').value) {
      thisEndDateControl.patchValue(null);
      this.clearControlValidators(thisEndDateControl);
    } else {
      this.setControlValidators(thisEndDateControl, [Validators.required]);
    }
  }

  policeForceSelected(index: number) {}

  applyToCourtForMoneyFromOffenderChange() {
    let applyToCourtForMoneyFromOffenderControl = this.form.get('racafInformation.applyToCourtForMoneyFromOffender');
    let expensesRequestedControl = this.form.get('racafInformation.expensesRequested');
    let expensesAwardedControl = this.form.get('racafInformation.expensesAwarded');
    let expensesReceivedControl = this.form.get('racafInformation.expensesReceived');
    if (applyToCourtForMoneyFromOffenderControl.value === CRMMultiBoolean.True) {
      this.setControlValidators(expensesRequestedControl, [Validators.required]);
      this.setControlValidators(expensesAwardedControl, [Validators.required]);
      this.setControlValidators(expensesReceivedControl, [Validators.required]);
    } else {
      expensesRequestedControl.patchValue('');
      expensesAwardedControl.patchValue('');
      expensesReceivedControl.patchValue('');
      this.clearControlValidators(expensesRequestedControl);
      this.clearControlValidators(expensesAwardedControl);
      this.clearControlValidators(expensesReceivedControl);
    }
  }

  moreThanOneOffenderChange(val: boolean) {
    this.showAddMoreOffenders = val;
    this.form.get('showAddMoreOffenders').patchValue(val);

    if (val == false) {
      let additionalOffenders = this.form.get('additionalOffenders') as UntypedFormArray;
      while (additionalOffenders.length > 0) {
        additionalOffenders.removeAt(0);
      }
    }
  }

  addOffender() {
    let additionalOffenders = this.form.get('additionalOffenders') as UntypedFormArray;
    if (additionalOffenders.length < 5) {
      additionalOffenders.push(this.crimeInfoHelper.createAdditionalOffender(this.fb));
    }

    if (additionalOffenders.length == 5) this.showAddMoreOffenders = false;
  }

  removeOffender(index: number) {
    let additionalOffenders = this.form.get('additionalOffenders') as UntypedFormArray;
    additionalOffenders.removeAt(index);

    if (additionalOffenders.length < 5) this.showAddMoreOffenders = true;
  }
}
