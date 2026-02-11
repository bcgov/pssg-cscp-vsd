import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ApplicationType } from '../enums-list';
import { POSTAL_CODE } from '../regex.constants';
import { EmailValidator } from '../validators/email.validator';

export class ExpenseInfoHelper {
  postalRegex = POSTAL_CODE;
  public setupFormGroup(fb: UntypedFormBuilder, form_type: ApplicationType): UntypedFormGroup {
    //Victim Application
    let group: any = {
      haveMedicalExpenses: [false],
      haveDentalExpenses: [false],
      havePrescriptionDrugExpenses: [false],
      haveCounsellingExpenses: [false],
      haveLostEmploymentIncomeExpenses: [false],
      havePersonalPropertyLostExpenses: [false],
      haveProtectiveMeasureExpenses: [false],
      haveProtectiveMovingExpenses: [false],
      haveTransportationToObtainBenefits: [false],
      haveDisabilityExpenses: [false],
      haveCrimeSceneCleaningExpenses: [false],
      haveOtherExpenses: [false],
      otherSpecificExpenses: [''],
      additionalBenefitsDetails: [''],
      minimumExpensesSelected: ['', Validators.required],
      minimumOtherBenefitsSelected: [''], //, Validators.required],

      haveDisabilityPlanBenefits: [false],
      haveEmploymentInsuranceBenefits: [false],
      haveIncomeAssistanceBenefits: [false],
      haveCanadaPensionPlanBenefits: [false],
      haveAboriginalAffairsAndNorthernDevelopmentCanadaBenefits: [false],
      haveCivilActionBenefits: [false],
      haveOtherBenefits: [false],
      otherSpecificBenefits: [''],
      noneOfTheAboveBenefits: [false]
    };

    if (form_type === ApplicationType.Witness_Application) {
      group = {
        haveCounsellingExpenses: [false],
        haveCounsellingTransportation: [false],
        havePrescriptionDrugExpenses: [false],
        minimumExpensesSelected: ['', Validators.required],
        minimumOtherBenefitsSelected: [''], // Dynamically required

        haveCrimeSceneCleaningExpenses: [false],
        additionalBenefitsDetails: [''] //, Validators.required], ??
      };
    }
    if (form_type === ApplicationType.IFM_Application) {
      group = {
        haveCounsellingExpenses: [false],
        haveCounsellingTransportation: [false],
        havePrescriptionDrugExpenses: [false],
        haveVocationalServicesExpenses: [false],
        haveIncomeSupportExpenses: [false],
        haveChildcareExpenses: [false],
        haveLegalProceedingExpenses: [false],
        haveFuneralExpenses: [false],
        haveBereavementLeaveExpenses: [false],
        haveLostOfParentalGuidanceExpenses: [false],
        haveHomeMakerExpenses: [false],
        haveCrimeSceneCleaningExpenses: [false],
        haveOtherExpenses: [false],
        otherSpecificExpenses: [''],

        haveOtherBenefits: [false],
        otherSpecificBenefits: [''],
        missedWorkDueToDeathOfVictim: [''], //, Validators.required],
        didYouLoseWages: [''], //, Validators.required],
        sin: ['', [Validators.minLength(9), Validators.maxLength(9)]],
        daysWorkMissedStart: [''], //, Validators.required],
        daysWorkMissedEnd: [''],
        employers: fb.array([this.createEmployerItem(fb)]),
        mayContactEmployer: [''],
        minimumExpensesSelected: ['', Validators.required],
        minimumOtherBenefitsSelected: [''], //, Validators.required],

        additionalBenefitsDetails: [''], //, Validators.required], ??
        haveLifeInsuranceBenefits: [false],
        haveDisabilityPlanBenefits: [false],
        haveEmploymentInsuranceBenefits: [false],
        haveIncomeAssistanceBenefits: [false],
        haveCanadaPensionPlanBenefits: [false],
        haveAboriginalAffairsAndNorthernDevelopmentCanadaBenefits: [false],
        haveCivilActionBenefits: [false]
        // Have to turn validation off for now - in case no death date. Though, if death date, then there should be validation
        // TODO: Figure out how to do this.
      };
    }
    return fb.group(group);
  }

  createEmployerItem(fb: UntypedFormBuilder): UntypedFormGroup {
    return fb.group({
      employerName: [''],
      employerPhoneNumber: [''],
      employerFax: [''],
      employerEmail: ['', [EmailValidator()]],
      employerFirstName: [''],
      employerLastName: [''],
      employerAddress: fb.group({
        line1: [''],
        line2: [''],
        city: [''],
        postalCode: ['', [Validators.pattern(this.postalRegex)]],
        province: [{ value: 'British Columbia', disabled: false }],
        country: [{ value: 'Canada', disabled: false }]
      })
    });
  }
}
