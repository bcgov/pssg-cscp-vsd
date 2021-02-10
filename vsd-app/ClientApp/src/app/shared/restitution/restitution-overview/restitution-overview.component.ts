import { FormBase } from "../../form-base";
import { OnInit, Component, Input } from "@angular/core";
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from "@angular/material";
import { FormGroup, ControlContainer } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS, IOptionSetVal, ResitutionForm } from "../../enums-list";

@Component({
    selector: 'app-restitution-overview',
    templateUrl: './restitution-overview.component.html',
    styleUrls: ['./restitution-overview.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})
export class RestitutionOverviewComponent extends FormBase implements OnInit {
    @Input() formType: IOptionSetVal;
    public form: FormGroup;
    ResitutionForm = ResitutionForm;
    applicant: string = "";

    constructor(
        private controlContainer: ControlContainer,
    ) {
        super();
    }

    ngOnInit() {
        this.form = <FormGroup>this.controlContainer.control;
        setTimeout(() => { this.form.markAsTouched(); }, 0);
        // console.log("overview component");
        // console.log(this.formType);

        if (this.formType.val === ResitutionForm.Victim.val) {
            this.applicant = "Victim";
        }
        else if (this.formType.val === ResitutionForm.Offender.val) {
            this.applicant = "Offender";
        }
    }
}