import { OnInit, Component, Input, OnDestroy } from "@angular/core";
import { FormBase } from "../form-base";
import { MatDialog, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from "@angular/material";
import { FormGroup, FormBuilder, ControlContainer, AbstractControl, Validators } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS, ApplicationType } from "../enums-list";
import { Subscription } from "rxjs";

@Component({
    selector: 'app-victim-information',
    templateUrl: './victim-information.component.html',
    styleUrls: ['./victim-information.component.scss'],
    providers: [
        // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
        // application's root module. We provide it at the component level here, due to limitations of
        // our example generation script.
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})
export class VictimInformationComponent extends FormBase implements OnInit, OnDestroy {
    @Input() formType: number;
    public form: FormGroup;
    ApplicationType = ApplicationType;
    todaysDate = new Date(); // for the birthdate validation
    oldestHuman = new Date(this.todaysDate.getFullYear() - 120, this.todaysDate.getMonth(), this.todaysDate.getDay());
    phoneIsRequired: boolean = false;
    emailIsRequired: boolean = false;
    addressIsRequired: boolean = false;

    iHaveOtherNamesSubscription: Subscription;

    constructor(
        private controlContainer: ControlContainer,
        private matDialog: MatDialog,
        private fb: FormBuilder,
    ) {
        super();
    }

    ngOnInit() {
        this.form = <FormGroup>this.controlContainer.control;
        // console.log("victim info component");
        // console.log(this.form);

        if (this.form.get('mostRecentMailingAddressSameAsPersonal').value === true) {
            this.copyPersonalAddressToVictimAddress(this.form.parent);
        }

        if (this.formType === ApplicationType.IFM_Application || this.formType === ApplicationType.Witness_Application) {
            this.form.get('mostRecentMailingAddressSameAsPersonal').valueChanges.subscribe(value => {
                this.copyPersonalAddressToVictimAddress(this.form.parent);
            });
        }

        this.iHaveOtherNamesSubscription = this.form.get('iHaveOtherNames').valueChanges.subscribe(value => {
            let otherFirstNameControl = this.form.get('otherFirstName');
            let otherLastNameControl = this.form.get('otherLastName');
            let dateOfNameChangeControl = this.form.get('dateOfNameChange');
            if (value === true) {
                this.setControlValidators(otherFirstNameControl, [Validators.required]);
                this.setControlValidators(otherLastNameControl, [Validators.required]);
                this.setControlValidators(dateOfNameChangeControl, [Validators.required]);
            }
            else {
                this.clearControlValidators(otherFirstNameControl);
                this.clearControlValidators(otherLastNameControl);
                this.clearControlValidators(dateOfNameChangeControl);
            }
        });
    }

    ngOnDestroy() {
        this.iHaveOtherNamesSubscription.unsubscribe();
    }
}