import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { ApplicationType } from "../enums-list";
import { POSTAL_CODE } from "../regex.constants";

export class ExpenseInfoHelper {
    postalRegex = POSTAL_CODE;
    public setupFormGroup(fb: FormBuilder, form_type: ApplicationType): FormGroup {
        let group: any = {
            haveMedicalExpenses: [false],
            haveDentalExpenses: [false],
            havePrescriptionDrugExpenses: [false],
            haveCounsellingExpenses: [false],
            haveLostEmploymentIncomeExpenses: [false],
            havePersonalPropertyLostExpenses: [false],
            haveProtectiveMeasureExpenses: [false],
            haveDisabilityExpenses: [false],
            haveCrimeSceneCleaningExpenses: [false],
            haveOtherExpenses: [false],
            otherSpecificExpenses: [''],
            minimumExpensesSelected: ['', Validators.required],

            haveDisabilityPlanBenefits: [false],
            haveEmploymentInsuranceBenefits: [false],
            haveIncomeAssistanceBenefits: [false],
            haveCanadaPensionPlanBenefits: [false],
            haveAboriginalAffairsAndNorthernDevelopmentCanadaBenefits: [false],
            haveCivilActionBenefits: [false],
            haveOtherBenefits: [false],
            otherSpecificBenefits: [''],
            noneOfTheAboveBenefits: [false],
        };

        if (form_type === ApplicationType.Witness_Application) {
            group = {
                haveCounsellingExpenses: [false],
                haveCounsellingTransportation: [false],
                havePrescriptionDrugExpenses: [false],
                minimumExpensesSelected: ['', Validators.required],

                haveCrimeSceneCleaningExpenses: [false],
                noneOfTheAboveExpenses: [''],
                additionalBenefitsDetails: [''],//, Validators.required], ??
                minimumAdditionalBenefitsSelected: [''], // Dynamically required

                // missedWorkDueToDeathOfVictim: [''], // Dynamically required
                // didYouLoseWages: [''], //, Validators.required],
                // daysWorkMissedStart: [''], //, Validators.required],
                // daysWorkMissedEnd: [''],
                // employers: fb.array([this.createEmployerItem(fb)]),
                // mayContactEmployer: [''],

                // haveDisabilityPlanBenefits: [false],
                // haveEmploymentInsuranceBenefits: [false],
                // haveIncomeAssistanceBenefits: [false],
                // haveCanadaPensionPlanBenefits: [false],
                // haveAboriginalAffairsAndNorthernDevelopmentCanadaBenefits: [false],
                // haveCivilActionBenefits: [false],
                // haveOtherBenefits: [false],
                // otherSpecificBenefits: [''],
                // noneOfTheAboveBenefits: [false],
                // minimumOtherBenefitsSelected: [''], // Dynamically required
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
                noneOfTheAboveExpenses: [''],
                missedWorkDueToDeathOfVictim: [''],//, Validators.required],
                didYouLoseWages: [''], //, Validators.required],
                sin: ['', [Validators.minLength(9), Validators.maxLength(9)]],
                areYouStillOffWork: [''],
                daysWorkMissedStart: [''], //, Validators.required],
                daysWorkMissedEnd: [''],
                employers: fb.array([this.createEmployerItem(fb)]),
                mayContactEmployer: [''],
                minimumExpensesSelected: ['', Validators.required],

                additionalBenefitsDetails: [''],//, Validators.required], ??
                haveDisabilityPlanBenefits: [false],
                haveEmploymentInsuranceBenefits: [false],
                haveIncomeAssistanceBenefits: [false],
                haveCanadaPensionPlanBenefits: [false],
                haveAboriginalAffairsAndNorthernDevelopmentCanadaBenefits: [false],
                haveCivilActionBenefits: [false],
                haveOtherBenefits: [false],
                otherSpecificBenefits: [''],
                noneOfTheAboveBenefits: [false],
            }
        }
        return fb.group(group);
    }

    createEmployerItem(fb: FormBuilder): FormGroup {
        return fb.group({
            employerName: [''],
            employerPhoneNumber: [''],
            employerFirstName: [''],
            employerLastName: [''],
            employerAddress: fb.group({
                line1: [''],
                line2: [''],
                city: [''],
                postalCode: ['', [Validators.pattern(this.postalRegex)]],
                province: [{ value: 'British Columbia', disabled: false }],
                country: [{ value: 'Canada', disabled: false }],
            })
        });
    }
}