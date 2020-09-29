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

    contactInfoSubscription: Subscription;
    addressInfoSubscription: Subscription;

    constructor(
        private controlContainer: ControlContainer,
        private matDialog: MatDialog,
        private fb: FormBuilder,
    ) {
        super();
    }

    ngOnInit() {
        this.form = <FormGroup>this.controlContainer.control;
        setTimeout(() => { this.form.markAsTouched(); }, 0);
        console.log("victim info component");
        console.log(this.form);

        if (this.form.get('victimSameContactInfo').value === true) {
            this.copyPersonalContactInfoToVictim(this.form.parent);
        }

        if (this.form.get('mostRecentMailingAddressSameAsPersonal').value === true) {
            this.copyPersonalAddressToVictimAddress(this.form.parent);
        }

        if (this.formType === ApplicationType.IFM_Application || this.formType === ApplicationType.Witness_Application) {
            this.addressInfoSubscription = this.form.get('mostRecentMailingAddressSameAsPersonal').valueChanges.subscribe(value => {
                this.copyPersonalAddressToVictimAddress(this.form.parent);
            });
            this.contactInfoSubscription = this.form.get('victimSameContactInfo').valueChanges.subscribe(value => {
                this.copyPersonalContactInfoToVictim(this.form.parent);
            });
        }
    }

    ngOnDestroy() {
        if (this.formType === ApplicationType.IFM_Application || this.formType === ApplicationType.Witness_Application) {
            if (this.addressInfoSubscription) this.addressInfoSubscription.unsubscribe();
            if (this.contactInfoSubscription) this.contactInfoSubscription.unsubscribe();
        }
    }

    iHaveOtherNamesChange(val: boolean) {
        if (!val) {
            let otherFirstNameControl = this.form.get('otherFirstName');
            let otherLastNameControl = this.form.get('otherLastName');
            let dateOfNameChangeControl = this.form.get('dateOfNameChange');

            otherFirstNameControl.patchValue('');
            otherLastNameControl.patchValue('');
            dateOfNameChangeControl.patchValue('');
        }
    }
}