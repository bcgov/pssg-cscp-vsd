import { OnInit, Component, Input } from "@angular/core";
import { FormBase } from "../form-base";
import { CanDeactivateGuard } from "../../services/can-deactivate-guard.service";
import { MatDialogConfig, MatDialog, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from "@angular/material";
import { DeactivateGuardDialog } from "../guard-dialog/guard-dialog.component";
import { FormArray, FormGroup, Validators, FormBuilder, ControlContainer } from "@angular/forms";
import { FileBundle } from "../../models/file-bundle";
import { SignPadDialog } from "../../sign-dialog/sign-dialog.component";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS, ApplicationType } from "../enums-list";

@Component({
    selector: 'app-crime-information',
    templateUrl: './crime-information.component.html',
    styleUrls: ['./crime-information.component.scss'],
    providers: [
        // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
        // application's root module. We provide it at the component level here, due to limitations of
        // our example generation script.
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})
export class CrimeInformationComponent extends FormBase implements OnInit {
    @Input() formType: number;
    public form: FormGroup;
    crimeLocationItems: FormArray;
    showAddCrimeLocation: boolean = true;
    showRemoveCrimeLocation: boolean = false;

    policeReportItems: FormArray;
    showAddPoliceReport: boolean = true;
    showRemovePoliceReport: boolean = false;

    courtFileItems: FormArray;
    showAddCourtInfo: boolean = true;
    showRemoveCourtInfo: boolean = false;

    todaysDate = new Date();

    ApplicationType = ApplicationType;

    constructor(
        private controlContainer: ControlContainer,
        private matDialog: MatDialog,
        private fb: FormBuilder,
    ) {
        super();
    }

    ngOnInit() {
        this.form = <FormGroup>this.controlContainer.control;
        console.log("crime info component");
        console.log(this.form);
    }


    addCrimeLocation(): void {
        this.crimeLocationItems = this.form.get('crimeLocations') as FormArray;
        this.crimeLocationItems.push(this.createCrimeLocationItem());
        this.showAddCrimeLocation = this.crimeLocationItems.length < 5;
        this.showRemoveCrimeLocation = this.crimeLocationItems.length > 1;
    }

    removeCrimeLocation(index: number): void {
        this.crimeLocationItems = this.form.get('crimeLocations') as FormArray;
        this.crimeLocationItems.removeAt(index);
        this.showAddCrimeLocation = this.crimeLocationItems.length < 5;
        this.showRemoveCrimeLocation = this.crimeLocationItems.length > 1;
    }
    createCrimeLocationItem(): FormGroup {
        return this.fb.group({
            location: ['', Validators.required]
        });
    }

    addPoliceReport(): void {
        this.policeReportItems = this.form.get('policeReports') as FormArray;
        this.policeReportItems.push(this.createPoliceReport());
        this.showAddPoliceReport = this.policeReportItems.length < 5;
        this.showRemovePoliceReport = this.policeReportItems.length > 1;
    }

    removePoliceReport(index: number): void {
        this.policeReportItems = this.form.get('policeReports') as FormArray;
        this.policeReportItems.removeAt(index);
        this.showAddPoliceReport = this.policeReportItems.length < 5;
        this.showRemovePoliceReport = this.policeReportItems.length > 1;
    }

    createPoliceReport(): FormGroup {
        return this.fb.group({
            policeFileNumber: '',
            investigatingOfficer: '',
            policeDetachment: '',
            reportStartDate: '',
            reportEndDate: '',
            policeReportedMultipleTimes: ['']
        });
    }

    createCourtInfoItem(): FormGroup {
        return this.fb.group({
            courtFileNumber: '',
            courtLocation: ''
        });
    }

    addCourtInfo(): void {
        this.courtFileItems = this.form.get('courtFiles') as FormArray;
        this.courtFileItems.push(this.createCourtInfoItem());
        this.showAddCourtInfo = this.courtFileItems.length < 3;
        this.showRemoveCourtInfo = this.courtFileItems.length > 1;
    }

    removeCourtInfo(index: number): void {
        this.courtFileItems = this.form.get('courtFiles') as FormArray;
        this.courtFileItems.removeAt(index);
        this.showAddCourtInfo = this.courtFileItems.length < 3;
        this.showRemoveCourtInfo = this.courtFileItems.length > 1;
    }

    onFileBundle(fileBundle: FileBundle) {
        try {
            // save the files submitted from the component for attachment into the submitted form.
            const patchObject = {};
            patchObject['additionalInformationFiles'] = fileBundle;
            this.form.get('additionalInformationFiles.filename').patchValue(fileBundle.fileName[0]);
            var splitValues = fileBundle.fileData[0].split(',');

            //this.form.get('documentInformation.body').patchValue(fileBundle.fileData[0]);
            this.form.get('additionalInformationFiles.body').patchValue(splitValues[1]);

            //this.form.get('additionalInformationFiles').value['0'].filename = fileBundle.fileName[0];
            //var splitValues = fileBundle.fileData[0].split(',');
            //this.form.get('additionalInformationFiles').value['0'].body = splitValues[1];

            fileBundle = fileBundle;
        }
        catch (e) {
            console.log(e);
        }
    }

    showSignPad(group, control): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;

        const dialogRef = this.matDialog.open(SignPadDialog, dialogConfig);
        dialogRef.afterClosed().subscribe(
            data => {
                // TODO: This timeout is required so the page structure doesn't explode after the signature is filled.
                // why is this is like this. Leaving the patch in there.
                // I suspect that maybe converting the signature to png needs to finish before proceeding
                // Maybe this will fix itself as the form is cleaned up.
                // This actually breaks the whole page layout on closing the signature box if removed. WHAAAA
                setTimeout(() => {
                    var patchObject = {};
                    patchObject[control] = data;
                    this.form.get(group).patchValue(
                        patchObject
                    );
                }, 1)
            },
            err => console.log(err)
        );
    }

}