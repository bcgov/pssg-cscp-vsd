import { FormBase } from "../form-base";
import { OnInit, Component, Input } from "@angular/core";
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatDialog, MatStepper } from "@angular/material";
import { FormGroup, ControlContainer, FormArray } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS, ApplicationType, EnumHelper, OnBehalfOf, CRMBoolean, CRMMultiBoolean } from "../enums-list";
import { AddressHelper } from "../address/address.helper";

@Component({
    selector: 'app-application-review',
    templateUrl: './application-review.component.html',
    styleUrls: ['./application-review.component.scss'],
    providers: [
        // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
        // application's root module. We provide it at the component level here, due to limitations of
        // our example generation script.
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})
export class ApplicationReviewComponent extends FormBase implements OnInit {
    @Input() formType: number;
    @Input() parentStepper: MatStepper;
    public form: FormGroup;
    ApplicationType = ApplicationType;
    CRMBoolean = CRMBoolean;
    CRMMultiBoolean = CRMMultiBoolean;
    OnBehalfOf = OnBehalfOf;
    enumHelper = new EnumHelper();

    courtFiles: FormArray;
    crimeLocations: FormArray;
    policeReports: FormArray;
    otherMedicalTreatments: FormArray;
    employers: FormArray;

    addressHelper = new AddressHelper();

    pages: any;



    constructor(
        private controlContainer: ControlContainer,
    ) {
        super();
    }

    ngOnInit() {
        this.form = <FormGroup>this.controlContainer.control;
        setTimeout(() => { this.form.markAsTouched(); }, 0);
        this.crimeLocations = this.form.get('crimeInformation.crimeLocations') as FormArray;
        this.courtFiles = this.form.get('crimeInformation.courtFiles') as FormArray;
        this.policeReports = this.form.get('crimeInformation.policeReports') as FormArray;
        this.otherMedicalTreatments = this.form.get('medicalInformation.otherTreatments') as FormArray;
        if (this.formType === ApplicationType.Victim_Application) {
            this.employers = this.form.get('employmentIncomeInformation.employers') as FormArray;
            this.pages = VictimApplicationPages;
        }
        if (this.formType === ApplicationType.IFM_Application) {
            this.employers = this.form.get('expenseInformation.employers') as FormArray;
            this.pages = IFMApplicationPages;
        }
        if (this.formType === ApplicationType.Witness_Application) {
            this.pages = WitnessApplicationPages;
        }
        // console.log("review component");
        // console.log(this.form);

        // console.log(this.pages);
    }

    gotoPageIndex(selectPage: number): void {
        window.scroll(0, 0);
        this.parentStepper.selectedIndex = selectPage;
    }
}

enum VictimApplicationPages {
    Overview,
    Personal,
    Crime,
    Medical,
    Expense,
    Employment,
    OnBehalfOf,
    Declaration,
    Authorization,
    Review
}

enum IFMApplicationPages {
    Overview,
    Personal,
    Victim,
    Crime,
    Medical,
    Expense,
    OnBehalfOf,
    Declaration,
    Authorization,
    Review
}

enum WitnessApplicationPages {
    Overview,
    Personal,
    Victim,
    Crime,
    Medical,
    Expense,
    OnBehalfOf,
    Declaration,
    Authorization,
    Review
}