import { FormBase } from "../form-base";
import { Input, Component, OnInit } from "@angular/core";
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatDialog, MatDialogConfig } from "@angular/material";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS, ApplicationType, EnumHelper } from "../enums-list";
import { FormGroup, ControlContainer, FormBuilder, FormArray, Validators } from "@angular/forms";
import { SignPadDialog } from "../../sign-dialog/sign-dialog.component";


@Component({
    selector: 'app-authorization-information',
    templateUrl: './authorization-information.component.html',
    styleUrls: ['./authorization-information.component.scss'],
    providers: [
        // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
        // application's root module. We provide it at the component level here, due to limitations of
        // our example generation script.
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})
export class AuthorizationInformationComponent extends FormBase implements OnInit {
    @Input() formType: number;
    public form: FormGroup;
    ApplicationType = ApplicationType;
    enumHelper = new EnumHelper();

    authorizedPersons: FormArray;
    showAddAuthorizationInformation: boolean = true;
    showRemoveAuthorization: boolean = true;

    constructor(
        private controlContainer: ControlContainer,
        private matDialog: MatDialog,
        private fb: FormBuilder,
    ) {
        super();
    }

    ngOnInit() {
        this.form = <FormGroup>this.controlContainer.control;
        // console.log("auth info component");
        // console.log(this.form);

        this.form.get('allowCvapStaffSharing').valueChanges.subscribe(value => {
          let authorizedPersonAuthorizesDiscussion = this.form.get('authorizedPersonAuthorizesDiscussion');
          let authorizedPersonSignature = this.form.get('authorizedPersonSignature');
          let authorizedPersonFullName = this.form.get('authorizedPersonFullName');
          let authorizedPersonRelationship = this.form.get('authorizedPersonRelationship');

          authorizedPersonAuthorizesDiscussion.clearValidators();
          authorizedPersonAuthorizesDiscussion.setErrors(null);
          authorizedPersonSignature.clearValidators();
          authorizedPersonSignature.setErrors(null);
          authorizedPersonFullName.clearValidators();
          authorizedPersonFullName.setErrors(null);
          authorizedPersonRelationship.clearValidators();
          authorizedPersonRelationship.setErrors(null);

            let useValidation = value === this.enumHelper.boolValues.Yes;
            if (useValidation) {
              authorizedPersonAuthorizesDiscussion.setValidators([Validators.required]);
              authorizedPersonSignature.setValidators([Validators.required]);
              authorizedPersonFullName.setValidators([Validators.required]);
              authorizedPersonRelationship.setValidators([Validators.required]);
            }

          authorizedPersonAuthorizesDiscussion.updateValueAndValidity();
          authorizedPersonSignature.updateValueAndValidity();
          authorizedPersonFullName.updateValueAndValidity();
          authorizedPersonRelationship.updateValueAndValidity();
        });
    }

    addAuthorizationInformation(makeAuthorizedSignatureRequired: boolean = false): void {
        this.authorizedPersons = this.form.get('authorizedPerson') as FormArray;
        this.authorizedPersons.push(this.createAuthorizedPerson());
        this.showAddAuthorizationInformation = this.authorizedPersons.length < 3;
        this.showRemoveAuthorization = this.authorizedPersons.length > 1;

        if (makeAuthorizedSignatureRequired) {
            let authorizedPersonSignature = this.form.get('authorizedPersonSignature');
            authorizedPersonSignature.setErrors(null);
            authorizedPersonSignature.setValidators([Validators.required]);
            authorizedPersonSignature.updateValueAndValidity();
        }
    }
    clearAuthorizationInformation(): void {
        // remove all AuthorizedInformation items
        this.authorizedPersons = this.form.get('authorizedPerson') as FormArray;
        while (this.authorizedPersons.length > 0) {
            this.authorizedPersons.removeAt(this.authorizedPersons.length - 1);
        }

        let authorizedPersonSignature = this.form.get('authorizedPersonSignature');
        authorizedPersonSignature.setErrors(null);
        authorizedPersonSignature.clearValidators();
        authorizedPersonSignature.updateValueAndValidity();
    }
    removeAuthorizationInformation(index: number): void {
        this.authorizedPersons = this.form.get('authorizedPerson') as FormArray;
        this.authorizedPersons.removeAt(index);
        this.showAddAuthorizationInformation = this.authorizedPersons.length < 3;
        this.showRemoveAuthorization = this.authorizedPersons.length > 1;
    }

    createAuthorizedPerson(): FormGroup {
        return this.fb.group({
            providerType: [''],
            providerTypeText: [''],
            authorizedPersonFullName: [''],
            authorizedPersonPhoneNumber: [''],
            authorizedPersonAgencyAddress: this.fb.group({
                line1: [''],
                line2: [''],
                city: [''],
                postalCode: [''],  // , [Validators.pattern(postalRegex)]
                province: [{ value: 'British Columbia', disabled: false }],
                country: [{ value: 'Canada', disabled: false }],
            }),
            authorizedPersonRelationship: [''],
            authorizedPersonAgencyName: [''],
        });
    }

    showSignPad(control): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;

        const dialogRef = this.matDialog.open(SignPadDialog, dialogConfig);
        dialogRef.afterClosed().subscribe(
            data => {
                var patchObject = {};
                patchObject[control] = data;
                this.form.patchValue(
                    patchObject
                );
            },
            err => console.log(err)
        );
    }
}
