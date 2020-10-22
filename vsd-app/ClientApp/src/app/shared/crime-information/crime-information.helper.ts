import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { ApplicationType } from "../enums-list";
import { POSTAL_CODE } from "../regex.constants";

export class CrimeInfoHelper {
    postalRegex = POSTAL_CODE;
    public setupFormGroup(fb: FormBuilder, form_type: ApplicationType): FormGroup {
        let group = {
            typeOfCrime: ['', Validators.required],

            unsureOfCrimeDates: [false],
            whenDidCrimeOccur: [''],
            crimePeriodStart: ['', Validators.required],
            crimePeriodEnd: [''],
            overOneYearFromCrime: [''],
            whyDidYouNotApplySooner: [''],

            crimeLocations: fb.array([this.createCrimeLocationItem(fb)]),
            crimeDetails: ['', Validators.required],
            crimeInjuries: ['', Validators.required],
            documents: fb.array([]),

            wasReportMadeToPolice: [0, [Validators.required, Validators.min(100000000), Validators.max(100000002)]],

            policeReports: fb.array([]),
            noPoliceReportIdentification: [''],

            offenderFirstName: [''],
            offenderMiddleName: [''],
            offenderLastName: [''],
            offenderRelationship: [''],
            offenderBeenCharged: [0, [Validators.required, Validators.min(100000000), Validators.max(100000002)]],

            courtFiles: fb.array([]),

            haveYouSuedOffender: [0, [Validators.required, Validators.min(100000000), Validators.max(100000001)]],
            intendToSueOffender: [null],

            racafInformation: this.createRACAFInformation(fb),
        };

        if (form_type === ApplicationType.IFM_Application || form_type === ApplicationType.Witness_Application) {
            group['victimDeceasedFromCrime'] = ['', Validators.required];
            group['dateOfDeath'] = [''];
        }
        return fb.group(group);
    }

    createRACAFInformation(fb: FormBuilder): FormGroup {
        return fb.group({
            applyToCourtForMoneyFromOffender: [''],
            expensesRequested: [''],
            expensesAwarded: [null],
            expensesReceived: [null],
            willBeTakingLegalAction: [''],
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
            signName: [null],
            signature: [null],
        })
    }

    createCrimeLocationItem(fb: FormBuilder): FormGroup {
        return fb.group({
            location: ['', Validators.required]
        });
    }

    createPoliceReport(fb: FormBuilder): FormGroup {
        return fb.group({
            policeDetachment: [null, [Validators.required]],
            policeDetachmentOther: [''],
            policeFileNumber: [''],
            investigatingOfficer: [''],
            reportStartDate: [''],
            reportEndDate: [''],
            policeReportedMultipleTimes: ['']
        });
    }

    createCourtInfoItem(fb: FormBuilder): FormGroup {
        return fb.group({
            courtFileNumber: [''],
            courtLocation: ['', [Validators.required]]
        });
    }
}
