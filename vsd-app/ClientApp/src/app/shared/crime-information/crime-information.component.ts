import { OnInit, Component, Input, OnDestroy } from "@angular/core";
import { FormBase } from "../form-base";
import { MatDialogConfig, MatDialog, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatDatepickerInputEvent } from "@angular/material";
import { FormArray, FormGroup, Validators, FormBuilder, ControlContainer, FormControl } from "@angular/forms";
import { FileBundle } from "../../models/file-bundle";
import { SignPadDialog } from "../../sign-dialog/sign-dialog.component";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS, ApplicationType, CRMBoolean, CRMMultiBoolean } from "../enums-list";
import * as moment from 'moment';
import { CrimeInfoHelper } from "./crime-information.helper";
import { config } from '../../../config';
import { Subscription } from "rxjs";
import { forEach } from "@angular/router/src/utils/collection";

@Component({
  selector: 'app-crime-information',
  templateUrl: './crime-information.component.html',
  styleUrls: ['./crime-information.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class CrimeInformationComponent extends FormBase implements OnInit, OnDestroy {
  @Input() formType: number;
  public form: FormGroup;
  CRMBoolean = CRMBoolean;
  CRMMultiBoolean = CRMMultiBoolean;
  crimeLocationItems: FormArray;
  showAddCrimeLocation: boolean = true;
  showRemoveCrimeLocation: boolean = false;

  wasReportMadeToPoliceSubscription: Subscription;
  applyToCourtForMoneyFromOffenderSubscription: Subscription;
  willBeTakingLegalActionSubscription: Subscription;
  offenderBeenChargedSubscription: Subscription;
  haveYouSuedOffenderSubscription: Subscription;
  intendToSueOffenderSubscription: Subscription;

  applyToCourtForMoneyFromOffender: FormControl;
  willBeTakingLegalAction: FormControl;
  signName: FormControl;
  signature: FormControl;
  thisCourtFileLocation: FormControl;

  CourtFileGroup: FormGroup;

  courtLocationItems: FormArray;
  policeReportItems: FormArray;

  showAddPoliceReport: boolean = true;
  showRemovePoliceReport: boolean = false;

  courtFileItems: FormArray;
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

  policeForceList = [];

  constructor(
    private controlContainer: ControlContainer,
    private matDialog: MatDialog,
    private fb: FormBuilder,
  ) {
    super();
  }

  ngOnInit() {
    this.form = <FormGroup>this.controlContainer.control;

    console.log("crime info component");
    console.log(this.form);
    // Commented out in case they actually want to return this functionality
    //this.copyApplicantToRACAFSignature(this.form.parent);
    this.policeReportItems = this.form.get('policeReports') as FormArray;
    this.showRemovePoliceReport = this.policeReportItems.length > 1;

    let startDate = this.form.get('crimePeriodStart').value;
    this.showWhyDidYouNotApplySooner = moment(startDate).isBefore(this.oneYearAgo);

    this.wasReportMadeToPoliceSubscription = this.form.get('wasReportMadeToPolice').valueChanges.subscribe(value => {
      let noPoliceReportIdentification = this.form.get('noPoliceReportIdentification');
      if (value === CRMMultiBoolean.True) {
        this.addPoliceReport();
        noPoliceReportIdentification.clearValidators();
        noPoliceReportIdentification.setErrors(null);
        noPoliceReportIdentification.setValue('');
      }
      else {
        this.removeAllPoliceReports();

        noPoliceReportIdentification.setValidators([Validators.required]);
      }

      noPoliceReportIdentification.updateValueAndValidity();
    });

    this.applyToCourtForMoneyFromOffenderSubscription = this.form.get('racafInformation.applyToCourtForMoneyFromOffender').valueChanges.subscribe(value => {
      if (value === CRMMultiBoolean.True) {
        this.applyToCourtOrLegalYes();
      }
      else {
        this.applyToCourtNo();
      }
    });

    this.willBeTakingLegalActionSubscription = this.form.get('racafInformation.willBeTakingLegalAction').valueChanges.subscribe(value => {
      if (value === CRMMultiBoolean.True) {
        this.applyToCourtOrLegalYes();
      }
      else {
        this.legalChangesNo();
      }
    });

    this.offenderBeenChargedSubscription = this.form.get('offenderBeenCharged').valueChanges.subscribe(value => {
      if (value === CRMMultiBoolean.True) {
        // Yes
        this.offenderBeenChargedYes();
      }
      else {
        // No or Unknown
        this.offenderBeenChargedNo();
      }
    });

    this.haveYouSuedOffenderSubscription = this.form.get('haveYouSuedOffender').valueChanges.subscribe(value => {
      if (value === CRMBoolean.True) {
        this.suedOrIntendToSueYes();
      }
      else {
        this.suedNo();
      }
    });

    this.intendToSueOffenderSubscription = this.form.get('intendToSueOffender').valueChanges.subscribe(value => {
      if (value === CRMMultiBoolean.True) {
        this.suedOrIntendToSueYes();
      }
      else {
        this.intendToSueNo();
      }
    });

    this.policeForceList = config.police_detachments;
  }

  ngOnDestroy() {
    this.wasReportMadeToPoliceSubscription.unsubscribe();
    this.applyToCourtForMoneyFromOffenderSubscription.unsubscribe();
    this.willBeTakingLegalActionSubscription.unsubscribe();
    this.haveYouSuedOffenderSubscription.unsubscribe();
    this.intendToSueOffenderSubscription.unsubscribe();
    this.offenderBeenChargedSubscription.unsubscribe();
  }

  addCrimeLocation(): void {
    this.crimeLocationItems = this.form.get('crimeLocations') as FormArray;
    this.crimeLocationItems.push(this.crimeInfoHelper.createCrimeLocationItem(this.fb));
    this.showAddCrimeLocation = this.crimeLocationItems.length < 5;
    this.showRemoveCrimeLocation = this.crimeLocationItems.length > 1;
  }

  removeCrimeLocation(index: number): void {
    this.crimeLocationItems = this.form.get('crimeLocations') as FormArray;
    this.crimeLocationItems.removeAt(index);
    this.showAddCrimeLocation = this.crimeLocationItems.length < 5;
    this.showRemoveCrimeLocation = this.crimeLocationItems.length > 1;
  }

  addPoliceReport(): void {
    this.policeReportItems = this.form.get('policeReports') as FormArray;
    this.policeReportItems.push(this.crimeInfoHelper.createPoliceReport(this.fb));
    this.showAddPoliceReport = this.policeReportItems.length < 5;
    this.showRemovePoliceReport = this.policeReportItems.length > 1;

    this.policeReportMinDates.push(null)
  }

  removePoliceReport(index: number): void {
    this.policeReportItems = this.form.get('policeReports') as FormArray;
    this.policeReportItems.removeAt(index);
    this.showAddPoliceReport = this.policeReportItems.length < 5;
    this.showRemovePoliceReport = this.policeReportItems.length > 1;
    this.policeReportMinDates.splice(index, 1);
  }

  removeAllPoliceReports() {
    this.policeReportItems = this.form.get('policeReports') as FormArray;
    while (this.policeReportItems.length !== 0) {
      this.policeReportItems.removeAt(0);
    }
    this.policeReportMinDates = [];
  }

  offenderBeenChargedYes(): void {
    this.courtLocationItems = this.form.get('courtFiles') as FormArray;
    for (let i = 0; i < this.courtLocationItems.length; ++i) {
      this.CourtFileGroup = this.courtLocationItems.controls[i] as FormGroup;
      this.thisCourtFileLocation = this.CourtFileGroup.controls['courtLocation'] as FormControl;
      this.thisCourtFileLocation.setValidators([Validators.required]);
      this.thisCourtFileLocation.updateValueAndValidity();
    }
  }

  offenderBeenChargedNo(): void {
    this.courtLocationItems = this.form.get('courtFiles') as FormArray;
    for (let i = 0; i < this.courtLocationItems.length; ++i) {
      this.CourtFileGroup = this.courtLocationItems.controls[i] as FormGroup;
      this.thisCourtFileLocation = this.CourtFileGroup.controls['courtLocation'] as FormControl;
      this.thisCourtFileLocation.clearValidators();
      this.thisCourtFileLocation.setErrors(null);
      this.thisCourtFileLocation.setValue(null);
      this.thisCourtFileLocation.markAsTouched();
      this.thisCourtFileLocation.updateValueAndValidity();
    }
  }

  applyToCourtOrLegalYes(): void {
    this.signName = this.form.get('racafInformation.signName') as FormControl;
    this.signature = this.form.get('racafInformation.signature') as FormControl;
    this.signName.setValidators([Validators.required]);
    this.signName.markAsTouched();
    this.signName.updateValueAndValidity();
    this.signature.setValidators([Validators.required]);
    this.signature.markAsTouched();
    this.signature.updateValueAndValidity();
  }

  applyToCourtNo(): void {
    let willBeTakingLegal = this.form.get('racafInformation.willBeTakingLegalAction').value;
    this.signName = this.form.get('racafInformation.signName') as FormControl;
    this.signature = this.form.get('racafInformation.signature') as FormControl;
    if (willBeTakingLegal === 100000000) {
      this.signName.setValidators([Validators.required]);
      this.signName.markAsTouched();
      this.signName.updateValueAndValidity();
      this.signature.setValidators([Validators.required]);
      this.signature.markAsTouched();
      this.signature.updateValueAndValidity();
    }
    else {
      this.signName.clearValidators();
      this.signName.setErrors(null);
      this.signName.setValue(null);
      this.signName.markAsTouched();
      this.signName.updateValueAndValidity();
      this.signature.clearValidators();
      this.signature.setErrors(null);
      this.signature.setValue(null);
      this.signature.markAsTouched();
      this.signature.updateValueAndValidity();
    }
  }

  legalChangesNo(): void {
    let applyToCourt = this.form.get('racafInformation.applyToCourtForMoneyFromOffender').value;
    this.signature = this.form.get('racafInformation.signature') as FormControl;
    this.signName = this.form.get('racafInformation.signName') as FormControl;
    if (applyToCourt === 100000000) {
      this.signName.setValidators([Validators.required]);
      this.signName.markAsTouched();
      this.signName.updateValueAndValidity();
      this.signature.setValidators([Validators.required]);
      this.signature.markAsTouched();
      this.signature.updateValueAndValidity();
    }
    else {
      this.signName.clearValidators();
      this.signName.setErrors(null);
      this.signName.setValue(null);
      this.signName.markAsTouched();
      this.signName.updateValueAndValidity();
      this.signature.clearValidators();
      this.signature.setErrors(null);
      this.signature.setValue(null);
      this.signature.markAsTouched();
      this.signature.updateValueAndValidity();
    }
  }

  suedOrIntendToSueYes(): void {
    this.willBeTakingLegalAction = this.form.get('racafInformation.willBeTakingLegalAction') as FormControl;
    this.applyToCourtForMoneyFromOffender = this.form.get('racafInformation.applyToCourtForMoneyFromOffender') as FormControl;
    this.willBeTakingLegalAction.setValidators([Validators.required]);
    this.willBeTakingLegalAction.markAsTouched();
    this.willBeTakingLegalAction.updateValueAndValidity();
    this.applyToCourtForMoneyFromOffender.setValidators([Validators.required]);
    this.applyToCourtForMoneyFromOffender.markAsTouched();
    this.applyToCourtForMoneyFromOffender.updateValueAndValidity();
  }

  suedNo(): void {
    let intendToSue = this.form.get('intendToSueOffender').value;
    this.willBeTakingLegalAction = this.form.get('racafInformation.willBeTakingLegalAction') as FormControl;
    this.applyToCourtForMoneyFromOffender = this.form.get('racafInformation.applyToCourtForMoneyFromOffender') as FormControl;
    if (intendToSue === 100000000) {
      this.willBeTakingLegalAction.setValidators([Validators.required]);
      this.willBeTakingLegalAction.markAsTouched();
      this.willBeTakingLegalAction.updateValueAndValidity();
      this.applyToCourtForMoneyFromOffender.setValidators([Validators.required]);
      this.applyToCourtForMoneyFromOffender.markAsTouched();
      this.applyToCourtForMoneyFromOffender.updateValueAndValidity();
    }
    else {
      this.willBeTakingLegalAction.clearValidators();
      this.willBeTakingLegalAction.setErrors(null);
      this.willBeTakingLegalAction.setValue(null);
      this.willBeTakingLegalAction.markAsTouched();
      this.willBeTakingLegalAction.updateValueAndValidity();
      this.applyToCourtForMoneyFromOffender.clearValidators();
      this.applyToCourtForMoneyFromOffender.setErrors(null);
      this.applyToCourtForMoneyFromOffender.setValue(null);
      this.applyToCourtForMoneyFromOffender.markAsTouched();
      this.applyToCourtForMoneyFromOffender.updateValueAndValidity();
    }
  }

  intendToSueNo(): void {
    let haveYouSued = this.form.get('haveYouSuedOffender').value;
    this.willBeTakingLegalAction = this.form.get('racafInformation.willBeTakingLegalAction') as FormControl;
    this.applyToCourtForMoneyFromOffender = this.form.get('racafInformation.applyToCourtForMoneyFromOffender') as FormControl;
    if (haveYouSued === 100000001) {
      this.willBeTakingLegalAction.setValidators([Validators.required]);
      this.willBeTakingLegalAction.markAsTouched();
      this.willBeTakingLegalAction.updateValueAndValidity();
      this.applyToCourtForMoneyFromOffender.setValidators([Validators.required]);
      this.applyToCourtForMoneyFromOffender.markAsTouched();
      this.applyToCourtForMoneyFromOffender.updateValueAndValidity();
    }
    else {
      this.willBeTakingLegalAction.clearValidators();
      this.willBeTakingLegalAction.setErrors(null);
      this.willBeTakingLegalAction.setValue(null);
      this.willBeTakingLegalAction.markAsTouched();
      this.willBeTakingLegalAction.updateValueAndValidity();
      this.applyToCourtForMoneyFromOffender.clearValidators();
      this.applyToCourtForMoneyFromOffender.setErrors(null);
      this.applyToCourtForMoneyFromOffender.setValue(null);
      this.applyToCourtForMoneyFromOffender.markAsTouched();
      this.applyToCourtForMoneyFromOffender.updateValueAndValidity();
    }
  }

  //addOrRemoveSignature(): void {
  //  this.applyToCourtForMoneyFromOffender = this.form.get('racafInformation.applyToCourtForMoneyFromOffender') as FormControl;
  //  this.willBeTakingLegalAction = this.form.get('racafInformation.willBeTakingLegalAction') as FormControl;
  //  this.signName = this.form.get('racafInformation.signName') as FormControl;

  //  let applyForMoney = this.form.get('racafInformation.applyToCourtForMoneyFromOffender').value;
  //  let willBeTakingLegal = this.form.get('racafInformation.willBeTakingLegalAction').value;

  //  if (applyForMoney === 100000000 || willBeTakingLegal === 100000000) {
  //    this.signName.setValidators([Validators.required]);
  //    this.signName.markAsTouched();
  //    this.signName.updateValueAndValidity();
  //  }
  //  else {
  //    this.signName.clearValidators();
  //    this.signName.markAsTouched();
  //    this.signName.updateValueAndValidity();
  //  }
  //}

  addCourtInfo(): void {
    this.courtFileItems = this.form.get('courtFiles') as FormArray;
    this.courtFileItems.push(this.crimeInfoHelper.createCourtInfoItem(this.fb));
    this.showAddCourtInfo = this.courtFileItems.length < 3;
    this.showRemoveCourtInfo = this.courtFileItems.length > 1;
  }

  removeCourtInfo(index: number): void {
    this.courtFileItems = this.form.get('courtFiles') as FormArray;
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
      data => {
        var patchObject = {};
        patchObject[control] = data;
        this.form.get(group).patchValue(
          patchObject
        );
      },
      err => console.log(err)
    );
  }

  crimePeriodStartChange(event: MatDatepickerInputEvent<Date>) {
    this.crimePeriodStartDate = event.target.value;
    //validate that a selected end date is not before the start date
    let startDate = moment(event.target.value);

    let endDate = this.form.get('crimePeriodEnd').value;
    if (endDate && moment(endDate).isBefore(startDate)) {
      this.form.get('crimePeriodEnd').patchValue(null);
    }

    this.showWhyDidYouNotApplySooner = moment(startDate).isBefore(this.oneYearAgo);
    this.form.get('applicationFiledWithinOneYearFromCrime').patchValue(!this.showWhyDidYouNotApplySooner);
  }

  whenDidCrimeOccurChange(event) {
    let crimePeriodEndControl = this.form.get('crimePeriodEnd');

    if (this.form.get('whenDidCrimeOccur').value) {
      crimePeriodEndControl.setValidators([Validators.required]);
      crimePeriodEndControl.markAsTouched();
      crimePeriodEndControl.updateValueAndValidity();
    }
    else {
      this.form.get('crimePeriodEnd').patchValue(null);
      crimePeriodEndControl.clearValidators();
      crimePeriodEndControl.setErrors(null);
      crimePeriodEndControl.markAsTouched();
      crimePeriodEndControl.updateValueAndValidity();
    }
  }

  reportStartChange(index: number, event: MatDatepickerInputEvent<Date>) {
    this.policeReportMinDates[index] = event.target.value;
    //validate that a selected end date is not before the start date
    let startDate = moment(event.target.value);
    this.policeReportItems = this.form.get('policeReports') as FormArray;
    let thisReport = this.policeReportItems.at(index) as FormGroup;
    let endDate = moment(thisReport.get('reportEndDate').value);
    if (endDate.isBefore(startDate)) {
      thisReport.get('reportEndDate').patchValue('');
    }
  }

  clearReportEndDate(index: number) {
    this.policeReportItems = this.form.get('policeReports') as FormArray;
    let thisReport = this.policeReportItems.at(index) as FormGroup;

    if (thisReport.get('policeReportedMultipleTimes').value) {
      thisReport.get('reportEndDate').patchValue(null);
    }
  }

  policeForceSelected(index: number) {

  }

}
