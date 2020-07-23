import { FormBase } from "../form-base";
import { OnInit, Component, Input, OnDestroy } from "@angular/core";
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatDialog, MatDatepickerInputEvent } from "@angular/material";
import { FormGroup, ControlContainer, FormControl, AbstractControl, Validators, FormArray } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS, ApplicationType, CRMBoolean } from "../enums-list";
import { SummaryOfBenefitsDialog } from "../../summary-of-benefits/summary-of-benefits.component";
import * as moment from 'moment';
import { Subscription } from "rxjs";

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

    sinSubscription: Subscription;
    didMissWorkSubscription: Subscription;
  loseWagesSubscription: Subscription;
  missedWorkDueToDeathOfVictimSubscription: Subscription;

  daysWorkMissedStart: FormControl;
  daysWorkMissedEnd: FormControl;
  didYouLoseWages: FormControl;
  employers: FormArray;
  employerGroup: FormGroup;
  employersEmployerName: FormControl;
  employersEmployerPhoneNumber: FormControl;
  minimumOtherBenefitsSelected: FormControl;

  constructor(
        private controlContainer: ControlContainer,
        private matDialog: MatDialog,
    ) {
        super();
    }

    ngOnInit() {
        this.form = <FormGroup>this.controlContainer.control;
        // console.log("expense info component");
        // console.log(this.form);

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
                'haveDisabilityExpenses',
                'haveCrimeSceneCleaningExpenses',
                'haveOtherExpenses'
            ];
          this.ADDITIONAL_BENEFITS = ['haveDisabilityPlanBenefits',
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
            let endDate = this.form.get('daysWorkMissedEnd').value;
            if (endDate) {
                this.showCurrentlyOffWork = moment(endDate).isSame(new Date(), "day");
            }

            let didMissWorkControl = this.form.get('missedWorkDueToDeathOfVictim');
            let daysMissedStartControl = this.form.get('daysWorkMissedStart');
            let daysMissedEndControl = this.form.get('daysWorkMissedEnd');
            if (this.form.parent.get('crimeInformation.victimDeceasedFromCrime').value == true) {
                didMissWorkControl.setValidators([Validators.required]);
                daysMissedStartControl.setValidators([Validators.required]);
                daysMissedEndControl.setValidators([Validators.required]);
            }
            else {
                didMissWorkControl.clearValidators();
                didMissWorkControl.setErrors(null);
                daysMissedStartControl.clearValidators();
                daysMissedStartControl.setErrors(null);
                daysMissedEndControl.clearValidators();
                daysMissedEndControl.setErrors(null);
            }
            didMissWorkControl.updateValueAndValidity();
            daysMissedStartControl.updateValueAndValidity();
            daysMissedEndControl.updateValueAndValidity();

            this.sinSubscription = this.form.get('sin').valueChanges.subscribe((value) => {
                if (value === null) value = '';
                this.form.parent.get('personalInformation').get('sin').patchValue(value);
            });

            this.didMissWorkSubscription = didMissWorkControl.valueChanges.subscribe((value) => {
                let didYouLoseWagesControl = this.form.get('didYouLoseWages');
                if (value === CRMBoolean.True) {
                    didYouLoseWagesControl.setValidators([Validators.required]);
                }
                else {
                    didYouLoseWagesControl.clearValidators();
                    didYouLoseWagesControl.setErrors(null);
                    // didYouLoseWagesControl.patchValue(null);
                }
                didYouLoseWagesControl.updateValueAndValidity();
            });

            this.loseWagesSubscription = this.form.get('didYouLoseWages').valueChanges.subscribe((value) => {
                let sinControl = this.form.get('sin');
                if (value === CRMBoolean.True) {
                    sinControl.setValidators([Validators.required]);
                }
                else {
                    sinControl.clearValidators();
                    sinControl.setErrors(null);
                }
                sinControl.updateValueAndValidity();
            });



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
                'noneOfTheAboveExpenses'
          ];
          this.OTHER_BENEFITS = [
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
        if (this.formType === ApplicationType.Witness_Application) {
            this.header = "Benefits";
            this.BENEFITS = [
                'haveCounsellingExpenses',
                'haveCounsellingTransportation',
                'havePrescriptionDrugExpenses'
            ];
          this.ADDITIONAL_BENEFITS = [
                'haveCrimeSceneCleaningExpenses',
                'noneOfTheAboveExpenses'
            ];
        }

      this.missedWorkDueToDeathOfVictimSubscription = this.form.get('missedWorkDueToDeathOfVictim').valueChanges.subscribe(value => {
        if (value === CRMBoolean.True) {
          this.missedWorkTrue();
        }
        else {
          this.missedWorkFalse();
        }
      });
    }

    ngOnDestroy() {
        if (this.formType === ApplicationType.IFM_Application) {
          this.sinSubscription.unsubscribe();
          this.didMissWorkSubscription.unsubscribe();
          this.loseWagesSubscription.unsubscribe();
          this.missedWorkDueToDeathOfVictimSubscription.unsubscribe();
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
        let control = this.form.get('areYouStillOffWork');
        if (!this.showCurrentlyOffWork) {
            control.patchValue('');
            control.clearValidators();
            control.setErrors(null);
        }
        else {
            control.setValidators([Validators.required]);
        }
        control.updateValueAndValidity();
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

    showSummaryOfBenefits(): void {
        const summaryDialogRef = this.matDialog.open(SummaryOfBenefitsDialog, { maxWidth: '800px !important', data: 'victim' });
    }

  missedWorkTrue(): void {
    this.daysWorkMissedStart = this.form.get('daysWorkMissedStart') as FormControl;
    this.daysWorkMissedEnd = this.form.get('daysWorkMissedEnd') as FormControl;
    this.didYouLoseWages = this.form.get('didYouLoseWages') as FormControl;
    this.minimumOtherBenefitsSelected = this.form.get('minimumOtherBenefitsSelected') as FormControl;
    this.employers = this.form.get('employers') as FormArray;
    this.daysWorkMissedStart.setValidators([Validators.required]);
    this.daysWorkMissedStart.markAsTouched();
    this.daysWorkMissedStart.updateValueAndValidity();
    this.daysWorkMissedEnd.setValidators([Validators.required]);
    this.daysWorkMissedEnd.markAsTouched();
    this.daysWorkMissedEnd.updateValueAndValidity();
    this.didYouLoseWages.setValidators([Validators.required]);
    this.didYouLoseWages.markAsTouched();
    this.didYouLoseWages.updateValueAndValidity();
    this.minimumOtherBenefitsSelected.setValidators([Validators.required]);
    this.minimumOtherBenefitsSelected.markAsTouched();
    this.minimumOtherBenefitsSelected.updateValueAndValidity();
    for (let i = 0; i < this.employers.length; ++i) {
      this.employerGroup = this.employers.controls[i] as FormGroup;
      this.employersEmployerName = this.employerGroup.controls['employerName'] as FormControl;
      this.employersEmployerName.setValidators([Validators.required]);
      this.employersEmployerName.markAsTouched();
      this.employersEmployerName.updateValueAndValidity();
      this.employersEmployerPhoneNumber = this.employerGroup.controls['employerPhoneNumber'] as FormControl;
      this.employersEmployerPhoneNumber.setValidators([Validators.required]);
      this.employersEmployerPhoneNumber.markAsTouched();
      this.employersEmployerPhoneNumber.updateValueAndValidity();
    }
    //this.noneOfTheAboveBenefitsForm = this.form.get('noneOfTheAboveBenefits') as FormControl;
    //this.noneOfTheAboveBenefitsForm.setValidators([Validators.required]);
    //this.noneOfTheAboveBenefitsForm.markAsTouched();
    //this.noneOfTheAboveBenefitsForm.updateValueAndValidity();
  }

  missedWorkFalse(): void {
    this.daysWorkMissedStart = this.form.get('daysWorkMissedStart') as FormControl;
    this.daysWorkMissedEnd = this.form.get('daysWorkMissedEnd') as FormControl;
    this.didYouLoseWages = this.form.get('didYouLoseWages') as FormControl;
    this.minimumOtherBenefitsSelected = this.form.get('minimumOtherBenefitsSelected') as FormControl;
    this.employers = this.form.get('employers') as FormArray;
    this.daysWorkMissedStart.clearValidators();
    this.daysWorkMissedStart.setErrors(null);
    this.daysWorkMissedStart.setValue(null);
    this.daysWorkMissedStart.markAsTouched();
    this.daysWorkMissedStart.updateValueAndValidity();
    this.daysWorkMissedEnd.clearValidators();
    this.daysWorkMissedEnd.setErrors(null);
    this.daysWorkMissedEnd.setValue(null);
    this.daysWorkMissedEnd.markAsTouched();
    this.daysWorkMissedEnd.updateValueAndValidity();
    this.didYouLoseWages.clearValidators();
    this.didYouLoseWages.setErrors(null);
    this.didYouLoseWages.setValue(null);
    this.didYouLoseWages.markAsTouched();
    this.didYouLoseWages.updateValueAndValidity();
    this.minimumOtherBenefitsSelected.clearValidators();
    this.minimumOtherBenefitsSelected.setErrors(null);
    this.minimumOtherBenefitsSelected.setValue(null);
    this.minimumOtherBenefitsSelected.markAsTouched();
    this.minimumOtherBenefitsSelected.updateValueAndValidity();
    for (let i = 0; i < this.employers.length; ++i) {
      this.employerGroup = this.employers.controls[i] as FormGroup;
      this.employersEmployerName = this.employerGroup.controls['employerName'] as FormControl;
      this.employersEmployerName.clearValidators();
      this.employersEmployerName.setErrors(null);
      this.employersEmployerName.setValue(null);
      this.employersEmployerName.markAsTouched();
      this.employersEmployerName.updateValueAndValidity();
      this.employersEmployerPhoneNumber = this.employerGroup.controls['employerPhoneNumber'] as FormControl;
      this.employersEmployerPhoneNumber.clearValidators();
      this.employersEmployerPhoneNumber.setErrors(null);
      this.employersEmployerPhoneNumber.setValue(null);
      this.employersEmployerPhoneNumber.markAsTouched();
      this.employersEmployerPhoneNumber.updateValueAndValidity();
    }
    //this.noneOfTheAboveBenefitsForm = this.form.get('noneOfTheAboveBenefits') as FormControl;
    //this.noneOfTheAboveBenefitsForm.clearValidators();
    //this.noneOfTheAboveBenefitsForm.setErrors(null);
    //this.noneOfTheAboveBenefitsForm.setValue(null);
    //this.noneOfTheAboveBenefitsForm.markAsTouched();
    //this.noneOfTheAboveBenefitsForm.updateValueAndValidity();
  }
}
