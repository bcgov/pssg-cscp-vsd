import { OnInit, Component, Input } from "@angular/core";
import { FormBase } from "../form-base";
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from "@angular/material";
import { FormGroup, Validators, FormBuilder, ControlContainer, FormControl } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS, ApplicationType } from "../enums-list";
import { COUNTRIES_ADDRESS } from "../address/country-list";
import { REPRESENTATIVE_LIST } from "../../constants/representative-list";
import { FileBundle } from "../../models/file-bundle";

@Component({
    selector: 'app-representative-information',
    templateUrl: './representative-information.component.html',
    styleUrls: ['./representative-information.component.scss'],
    providers: [
        // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
        // application's root module. We provide it at the component level here, due to limitations of
        // our example generation script.
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})
export class RepresentativeInformationComponent extends FormBase implements OnInit {
    @Input() formType: number;
    public form: FormGroup;
    ApplicationType = ApplicationType;
    provinceList: string[];
    relationshipList: string[];
    header: string;

    representativePhoneIsRequired: boolean = false;
    representativeEmailIsRequired: boolean = false;
    representativeAddressIsRequired: boolean = false;


    constructor(
        private controlContainer: ControlContainer,
    ) {
        super();
        var canada = COUNTRIES_ADDRESS.filter(c => c.name.toLowerCase() == 'canada')[0];
        this.provinceList = canada.areas;
        this.relationshipList = REPRESENTATIVE_LIST.name;
    }

    ngOnInit() {
        this.form = <FormGroup>this.controlContainer.control;
        console.log("representative info component");
        console.log(this.form);

        if (this.formType === ApplicationType.Victim_Application) {
            this.header = "Victim";
        }
        if (this.formType === ApplicationType.IFM_Application) {
            this.header = "Immediate Family Member";
        }
        if (this.formType === ApplicationType.Witness_Application) {
            this.header = "Witness";
        }

        this.form.get('completingOnBehalfOf').valueChanges.subscribe(value => {
            let representativeFirstName = this.form.get('representativeFirstName');
            let representativeLastName = this.form.get('representativeLastName');
            let representativePreferredMethodOfContact = this.form.get('representativePreferredMethodOfContact');

            representativeFirstName.clearValidators();
            representativeFirstName.setErrors(null);
            representativeLastName.clearValidators();
            representativeLastName.setErrors(null);
            representativePreferredMethodOfContact.clearValidators();
            representativePreferredMethodOfContact.setErrors(null);

            let useValidation = value === 100000002 || value === 100000003;
            this.setupRepresentativeContactInformation(0);  // Have to clear contact validators on contact method change
            if (useValidation) {
                representativeFirstName.setValidators([Validators.required]);
                representativeLastName.setValidators([Validators.required]);
                representativePreferredMethodOfContact.setValidators([Validators.required, Validators.min(100000000), Validators.max(100000002)]);
            }
        });

        this.form.get('representativePreferredMethodOfContact').valueChanges.subscribe(value => {
            let contactMethod = parseInt(value);
            this.setupRepresentativeContactInformation(contactMethod);
        });

    }

    setupRepresentativeContactInformation(contactMethod: number): void {
        let phoneControl = this.form.get('representativePhoneNumber');
        let emailControl = this.form.get('representativeEmail');
        let addressControls = [
            this.form.get('representativeAddress.country'),
            this.form.get('representativeAddress.province'),
            this.form.get('representativeAddress.city'),
            this.form.get('representativeAddress.line1'),
            this.form.get('representativeAddress.postalCode'),
        ];

        phoneControl.clearValidators();
        phoneControl.setErrors(null);
        emailControl.clearValidators();
        emailControl.setErrors(null);
        for (let control of addressControls) {
            control.clearValidators();
            control.setErrors(null);
        }

        if (contactMethod === 100000000) {
            phoneControl.setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(10)]);
            for (let control of addressControls) {
                control.setValidators([Validators.required]);
            }
            this.representativePhoneIsRequired = true;
            this.representativeEmailIsRequired = false;
            // this.representativeAddressIsRequired = true;
        } else if (contactMethod === 100000001) {
            emailControl.setValidators([Validators.required, Validators.email]);
            for (let control of addressControls) {
                control.setValidators([Validators.required]);
            }
            this.representativePhoneIsRequired = false;
            this.representativeEmailIsRequired = true;
            // this.representativeAddressIsRequired = true;
        } else if (contactMethod === 100000002) {
            // for (let control of addressControls) {
            //   control.setValidators([Validators.required]);
            // }
            this.representativePhoneIsRequired = false;
            this.representativeEmailIsRequired = false;
            // this.representativeAddressIsRequired = true;
        }

        for (let control of addressControls) {
            control.setValidators([Validators.required]);
        }
        this.representativeAddressIsRequired = true;

        phoneControl.markAsTouched();
        phoneControl.updateValueAndValidity();
        emailControl.markAsTouched();
        emailControl.updateValueAndValidity();
        for (let control of addressControls) {
            control.markAsTouched();
            control.updateValueAndValidity();
        }
    }

    onRepresentativeFileBundle(fileBundle: FileBundle) {
        try {
            // save the files submitted from the component for attachment into the submitted form.
            const patchObject = {};
            patchObject['legalGuardianFiles'] = fileBundle;

            let fileName = fileBundle.fileName[0] || "";
            this.form.get('legalGuardianFiles.filename').patchValue(fileName);

            let body = fileBundle.fileData.length > 0 ? fileBundle.fileData[0].split(',')[1] : "";
            this.form.get('legalGuardianFiles.body').patchValue(body);
        }
        catch (e) {
            console.log(e);
        }
    }
}