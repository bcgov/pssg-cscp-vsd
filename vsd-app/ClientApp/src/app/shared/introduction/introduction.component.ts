import { FormBase } from "../form-base";
import { OnInit, Component, Input } from "@angular/core";
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatDialog } from "@angular/material";
import { FormGroup, ControlContainer } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS, ApplicationType } from "../enums-list";
import { SummaryOfBenefitsDialog } from "../../summary-of-benefits/summary-of-benefits.component";

@Component({
    selector: 'app-introduction',
    templateUrl: './introduction.component.html',
    styleUrls: ['./introduction.component.scss'],
    providers: [
        // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
        // application's root module. We provide it at the component level here, due to limitations of
        // our example generation script.
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})
export class IntroductionComponent extends FormBase implements OnInit {
    @Input() formType: number;
    public form: FormGroup;
    ApplicationType = ApplicationType;
    applicant: string = "";

    isIE: boolean = false;

    constructor(
        private controlContainer: ControlContainer,
        private matDialog: MatDialog,
    ) {
        super();
    }

    ngOnInit() {
        var ua = window.navigator.userAgent;
        this.isIE = /MSIE|Trident/.test(ua);

        this.form = <FormGroup>this.controlContainer.control;
        setTimeout(() => { this.form.markAsTouched(); }, 0);
        console.log("intro component");
        console.log(this.form);

        if (this.formType === ApplicationType.Victim_Application) {
            this.applicant = "Victims";
        }
        else if (this.formType === ApplicationType.IFM_Application) {
            this.applicant = "Family Members";
        }
        else if (this.formType === ApplicationType.Witness_Application) {
            this.applicant = "Witnesses";
        }
    }

    showSummaryOfBenefits(): void {
        const summaryDialogRef = this.matDialog.open(SummaryOfBenefitsDialog, { data: this.formType });
    }
}