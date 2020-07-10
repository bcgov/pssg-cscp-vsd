import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { ApplicationType } from "../enums-list";
import { POSTAL_CODE } from "../regex.constants";

export class CrimeInfoHelper {
    postalRegex = POSTAL_CODE;
    public setupFormGroup(fb: FormBuilder, form_type: ApplicationType): FormGroup {
        let group = {
            typeOfCrime: ['', Validators.required],

            unsureOfCrimeDates: [''],
            whenDidCrimeOccur: [''],
            crimePeriodStart: ['', Validators.required],
            crimePeriodEnd: [''],
            applicationFiledWithinOneYearFromCrime: [''],
            whyDidYouNotApplySooner: [''],

            crimeLocations: fb.array([this.createCrimeLocationItem(fb)]),
            crimeDetails: ['', Validators.required],
            crimeInjuries: ['', Validators.required],
            documents: fb.array([]),

            wasReportMadeToPolice: [0, [Validators.required, Validators.min(100000000), Validators.max(100000002)]], // No: 100000000 Yes: 100000001

            policeReports: fb.array([this.createPoliceReport(fb)]),
            noPoliceReportIdentification: [''],

            offenderFirstName: [''],
            offenderMiddleName: [''],
            offenderLastName: [''],
            offenderRelationship: [''],
            offenderBeenCharged:
                [
                    0, [Validators.required, Validators.min(100000000), Validators.max(100000002)]
                ], // Yes: 100000000 No: 100000001 Undecided: 100000002

            courtFiles: fb.array([this.createCourtInfoItem(fb)]),

            haveYouSuedOffender:
                [
                    0, [Validators.required, Validators.min(100000000), Validators.max(100000001)]
                ], // No: 100000000   Yes: 100000001
            intendToSueOffender: [null], // Yes: 100000000 No: 100000001 Undecided: 100000002

            racafInformation: fb.group({
                applyToCourtForMoneyFromOffender: [null, [Validators.min(100000000), Validators.max(100000002)]],
                expensesRequested: [''],
                expensesAwarded: [null],
                expensesReceived: [null],
                willBeTakingLegalAction: [null, [Validators.min(100000000), Validators.max(100000002)]],
                haveLawyer: [null, [Validators.min(100000000), Validators.max(100000001)]],
                lawyerOrFirmName: [''],
                lawyerAddress: fb.group({
                    line1: [''],
                    line2: [''],
                    city: [''],
                    postalCode: ['', [Validators.pattern(this.postalRegex)]],
                    province: [{ value: 'British Columbia', disabled: false }],
                    country: [{ value: 'Canada', disabled: false }],
                }),
                signName: [''],
                signature: [''],
            }),
        };

        if (form_type === ApplicationType.IFM_Application || form_type === ApplicationType.Witness_Application) {
            group['victimDeceasedFromCrime'] = ['', Validators.required];
            group['dateOfDeath'] = [''];
        }
        return fb.group(group);
    }

    createCrimeLocationItem(fb: FormBuilder): FormGroup {
        return fb.group({
            location: ['', Validators.required]
        });
    }

    createPoliceReport(fb: FormBuilder): FormGroup {
        return fb.group({
            policeFileNumber: '',
            investigatingOfficer: '',
            policeDetachment: '',
            reportStartDate: '',
            reportEndDate: '',
            policeReportedMultipleTimes: ['']
        });
    }

    createCourtInfoItem(fb: FormBuilder): FormGroup {
        return fb.group({
            courtFileNumber: '',
            courtLocation: ''
        });
    }
}
