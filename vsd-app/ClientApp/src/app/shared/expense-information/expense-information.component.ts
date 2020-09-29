import { FormBase } from "../form-base";
import { OnInit, Component, Input, OnDestroy } from "@angular/core";
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatDialog, MatDatepickerInputEvent } from "@angular/material";
import { FormGroup, ControlContainer, FormControl, AbstractControl, Validators, FormArray } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS, ApplicationType, CRMBoolean } from "../enums-list";
import { SummaryOfBenefitsDialog } from "../../summary-of-benefits/summary-of-benefits.component";
import * as moment from 'moment';
import { Subscription } from "rxjs";
import { AddressHelper } from "../address/address.helper";
import { iLookupData } from "../../models/lookup-data.model";

@Component({
  selector: 'app-expense-information',
  templateUrl: './expense-information.component.html',
  styleUrls: ['./expense-information.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class ExpenseInformationComponent extends FormBase implements OnInit, OnDestroy {
  @Input() formType: number;
  @Input() lookupData: iLookupData;
  public form: FormGroup;
  ApplicationType = ApplicationType;

  BENEFITS: string[];
  ADDITIONAL_BENEFITS: string[];
  OTHER_BENEFITS: string[];
  header: string;

  showCurrentlyOffWork: boolean = false;
  today = new Date();
  minEndDate: Date;
  CRMBoolean = CRMBoolean;

  addressHelper = new AddressHelper();

  sinSubscription: Subscription;
  didMissWorkSubscription: Subscription;
  loseWagesSubscription: Subscription;
  missedWorkDueToDeathOfVictimSubscription: Subscription;

  constructor(
    private controlContainer: ControlContainer,
    private matDialog: MatDialog,
  ) {
    super();
  }

  ngOnInit() {
    this.form = <FormGroup>this.controlContainer.control;
    setTimeout(() => { this.form.markAsTouched(); }, 0);
    console.log("expense info component");
    console.log(this.form);

    if (this.formType === ApplicationType.Victim_Application) {
      this.header = "Loss";
      this.BENEFITS = [
        'haveMedicalExpenses',
        'haveDentalExpenses',
        'benefitsPrescription',
        'havePrescriptionDrugExpenses',
        'haveCounsellingExpenses',
        'haveLostEmploymentIncomeExpenses',
        'havePersonalPropertyLostExpenses',
        'haveProtectiveMeasureExpenses',
        'haveProtectiveMovingExpenses',
        'haveTransportationToObtainBenefits',
        'haveDisabilityExpenses',
        'haveCrimeSceneCleaningExpenses',
        'haveOtherExpenses'
      ];
      this.ADDITIONAL_BENEFITS = [
        'haveDisabilityPlanBenefits',
        'haveEmploymentInsuranceBenefits',
        'haveIncomeAssistanceBenefits',
        'haveCanadaPensionPlanBenefits',
        'haveAboriginalAffairsAndNorthernDevelopmentCanadaBenefits',
        'haveCivilActionBenefits',
        'haveOtherBenefits',
        'noneOfTheAboveBenefits'
      ];
    }
    if (this.formType === ApplicationType.IFM_Application) {

      setTimeout(() => {
        let didMissWorkControl = this.form.get('missedWorkDueToDeathOfVictim');
        let mayContactEmployer = this.form.get('mayContactEmployer').value === CRMBoolean.True;

        if (this.form.parent.get('crimeInformation.victimDeceasedFromCrime').value == CRMBoolean.True) {
          didMissWorkControl.setValidators([Validators.required]);
          this.mayContactEmployerChange(mayContactEmployer);
        }
        else {
          didMissWorkControl.clearValidators();
          didMissWorkControl.setErrors(null);
          this.mayContactEmployerChange(false);
        }
        didMissWorkControl.updateValueAndValidity();

        this.sinSubscription = this.form.get('sin').valueChanges.subscribe((value) => {
          if (value === null) value = '';
          this.form.parent.get('personalInformation').get('sin').patchValue(value);
        });

        this.didMissWorkSubscription = didMissWorkControl.valueChanges.subscribe((value) => {
          let didYouLoseWagesControl = this.form.get('didYouLoseWages');
          let minimumOtherBenefitsSelected = this.form.get('minimumOtherBenefitsSelected');
          if (!didYouLoseWagesControl && !minimumOtherBenefitsSelected) return;

          if (value === CRMBoolean.True) {
            didYouLoseWagesControl.setValidators([Validators.required]);
            // minimumOtherBenefitsSelected.setValidators([Validators.required]);
          }
          else {
            didYouLoseWagesControl.clearValidators();
            didYouLoseWagesControl.setErrors(null);
            didYouLoseWagesControl.patchValue('');

            // minimumOtherBenefitsSelected.clearValidators();
            // minimumOtherBenefitsSelected.setErrors(null);
            // minimumOtherBenefitsSelected.setValue(null);
          }
          didYouLoseWagesControl.updateValueAndValidity();
          // minimumOtherBenefitsSelected.updateValueAndValidity();
        });

        this.loseWagesSubscription = this.form.get('didYouLoseWages').valueChanges.subscribe((value) => {
          let sinControl = this.form.get('sin');
          let daysMissedStartControl = this.form.get('daysWorkMissedStart');
          let daysMissedEndControl = this.form.get('daysWorkMissedEnd');
          let employers = this.form.get('employers') as FormArray;
          if (value === CRMBoolean.True) {
            this.setControlValidators(daysMissedStartControl, [Validators.required]);
            this.setControlValidators(daysMissedEndControl, [Validators.required]);
            this.setControlValidators(sinControl, [Validators.required]);

            for (let i = 0; i < employers.length; ++i) {
              let employerGroup = employers.controls[i] as FormGroup;
              // let employersEmployerName = employerGroup.controls['employerName'] as FormControl;
              // this.setControlValidators(employersEmployerName, [Validators.required]);
              // let employersEmployerPhoneNumber = employerGroup.controls['employerPhoneNumber'] as FormControl;
              // this.setControlValidators(employersEmployerPhoneNumber, [Validators.required]);
            }
          }
          else {
            daysMissedStartControl.patchValue('');
            this.clearControlValidators(daysMissedStartControl);
            daysMissedEndControl.patchValue('');
            this.clearControlValidators(daysMissedEndControl);
            this.clearControlValidators(sinControl);
            this.form.get('mayContactEmployer').patchValue('');

            for (let i = 0; i < employers.length; ++i) {
              let employerGroup = employers.controls[i] as FormGroup;
              // let employersEmployerName = employerGroup.controls['employerName'] as FormControl;
              // this.clearControlValidators(employersEmployerName);

              // let employersEmployerPhoneNumber = employerGroup.controls['employerPhoneNumber'] as FormControl;
              // this.clearControlValidators(employersEmployerPhoneNumber);

              employerGroup.controls['employerName'].patchValue('');
              employerGroup.controls['employerPhoneNumber'].patchValue('');
              employerGroup.controls['employerFirstName'].patchValue('');
              employerGroup.controls['employerLastName'].patchValue('');
              employerGroup.controls['employerFax'].patchValue('');
              employerGroup.controls['employerEmail'].patchValue('');
              employerGroup.controls['employerAddress'].get('line1').patchValue('');
              employerGroup.controls['employerAddress'].get('line2').patchValue('');
              employerGroup.controls['employerAddress'].get('city').patchValue('');
              employerGroup.controls['employerAddress'].get('postalCode').patchValue('');
              employerGroup.controls['employerAddress'].get('province').patchValue('British Columbia');
              employerGroup.controls['employerAddress'].get('country').patchValue('Canada');
            }
          }
          sinControl.updateValueAndValidity();
          daysMissedStartControl.updateValueAndValidity();
          daysMissedEndControl.updateValueAndValidity();
        });

      }, 0);

      this.header = "Benefits";
      this.BENEFITS = [
        'haveCounsellingExpenses',
        'haveCounsellingTransportation',
        'havePrescriptionDrugExpenses'
      ];
      this.ADDITIONAL_BENEFITS = [
        'haveVocationalServicesExpenses',
        'haveIncomeSupportExpenses',
        'haveChildcareExpenses',
        'haveLegalProceedingExpenses',
        'haveFuneralExpenses',
        'haveBereavementLeaveExpenses',
        'haveLostOfParentalGuidanceExpenses',
        'haveHomeMakerExpenses',
        'haveCrimeSceneCleaningExpenses',
        'haveOtherExpenses'
      ];
      this.OTHER_BENEFITS = [
        'haveDisabilityPlanBenefits',
        'haveEmploymentInsuranceBenefits',
        'haveIncomeAssistanceBenefits',
        'haveCanadaPensionPlanBenefits',
        'haveAboriginalAffairsAndNorthernDevelopmentCanadaBenefits',
        'haveCivilActionBenefits',
        'haveOtherBenefits',
      ];
    }
    if (this.formType === ApplicationType.Witness_Application) {
      this.header = "Benefits";
      this.BENEFITS = [
        'haveCounsellingExpenses',
        'haveCounsellingTransportation',
        'havePrescriptionDrugExpenses'
      ];
      this.ADDITIONAL_BENEFITS = [
        'haveCrimeSceneCleaningExpenses',
        'haveOtherExpenses'
      ];
    }
  }

  ngOnDestroy() {
    if (this.formType === ApplicationType.IFM_Application) {
      if (this.sinSubscription) this.sinSubscription.unsubscribe();
      if (this.didMissWorkSubscription) this.didMissWorkSubscription.unsubscribe();
      if (this.loseWagesSubscription) this.loseWagesSubscription.unsubscribe();
    }
  }

  daysWorkMissedStartChange(event: MatDatepickerInputEvent<Date>) {
    this.minEndDate = event.target.value;
    //validate that a selected end date is not before the start date
    let startDate = moment(event.target.value);

    let endDate = this.form.get('daysWorkMissedEnd').value;
    if (endDate && moment(endDate).isBefore(startDate)) {
      this.form.get('daysWorkMissedEnd').patchValue('');
      this.form.get('daysWorkMissedEnd').updateValueAndValidity();
    }
  }

  daysWorkMissedEndChange(event: MatDatepickerInputEvent<Date>) {
    let endDate = moment(event.target.value);
    this.showCurrentlyOffWork = endDate.isSame(new Date(), "day");
  }

  changeGroupValidity(values: any): void {
    // whenever an expenseInformation checkbox is changed we
    // set whether the minimum expenses value is met into part of the form that isn't user editable.
    let expenseMinimumMet = '';
    let x: AbstractControl[] = [];
    this.BENEFITS.forEach((benefit) => {
      x.push(this.form.get(benefit));
    });

    //determine if one of the checkboxes is true
    let oneChecked = false;
    x.forEach(c => {
      // TODO: This should always return if not null because truthy. Second if should never trigger?
      if (oneChecked)
        return;
      if (c instanceof FormControl) {
        if (c.value === true)
          oneChecked = true;
      }
    });
    // fake a 'true' as a string
    expenseMinimumMet = oneChecked ? 'yes' : '';
    this.form.patchValue({
      minimumExpensesSelected: expenseMinimumMet
    });
  }

  changeAdditionalBenefitGroupValidity(values: any): void {
    let minimumBenefitsMet = '';
    let x: AbstractControl[] = [];
    this.ADDITIONAL_BENEFITS.forEach((benefit) => {
      x.push(this.form.get(benefit));
    });
    let oneChecked = false;
    x.forEach(c => {
      if (oneChecked)
        return;

      if (c instanceof FormControl) {
        if (c.value === true)
          oneChecked = true;
      }
    });

    // fake a 'true' as a string
    minimumBenefitsMet = oneChecked ? 'yes' : '';

    this.form.patchValue({
      minimumAdditionalBenefitsSelected: minimumBenefitsMet
    });
  }

  changeOtherBenefitValidity(values: any): void {
    // whenever an expenseInformation checkbox is changed we
    // set whether the minimum expenses value is met into part of the form that isn't user editable.
    let expenseMinimumMet = '';
    let x: AbstractControl[] = [];
    this.OTHER_BENEFITS.forEach((benefit) => {
      x.push(this.form.get(benefit));
    });

    //determine if one of the checkboxes is true
    let oneChecked = false;
    x.forEach(c => {
      // TODO: This should always return if not null because truthy. Second if should never trigger?
      if (oneChecked)
        return;
      if (c instanceof FormControl) {
        if (c.value === true)
          oneChecked = true;
      }
    });
    // fake a 'true' as a string
    expenseMinimumMet = oneChecked ? 'yes' : '';
    this.form.patchValue({
      minimumOtherBenefitsSelected: expenseMinimumMet
    });
  }

  mayContactEmployerChange(val: boolean) {
    let currentEmployers = this.form.get('employers') as FormArray;
    let thisEmployer = currentEmployers.controls[0] as FormGroup;

    if (thisEmployer) {
      let nameControl = thisEmployer.get('employerName');
      let phoneControl = thisEmployer.get('employerPhoneNumber');
      if (val) {
        this.setControlValidators(nameControl, [Validators.required]);
        this.setControlValidators(phoneControl, [Validators.required]);
        this.addressHelper.setAddressAsRequired(thisEmployer, 'employerAddress');
      }
      else {
        this.clearControlValidators(nameControl);
        this.clearControlValidators(phoneControl);
        this.addressHelper.clearAddressValidatorsAndErrors(thisEmployer, 'employerAddress');
      }
    }
  }

  showSummaryOfBenefits(): void {
    const summaryDialogRef = this.matDialog.open(SummaryOfBenefitsDialog, { data: this.formType });
  }

  isMyControlValid(control: AbstractControl) {
    return control.valid || !control.touched;
  }

  haveOtherExpensesChange(val) {
    if (!val) {
      this.form.get('otherSpecificExpenses').patchValue('');
    }
  }

  haveOtherBenefitsChange(val) {
    if (!val) {
      this.form.get('otherSpecificBenefits').patchValue('');
    }
  }
}
