import { OnInit, Component, Input } from "@angular/core";
import { FormBase } from "../form-base";
import { MatDialogConfig, MatDialog, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatDatepickerInputEvent } from "@angular/material";
import { FormArray, FormGroup, Validators, FormBuilder, ControlContainer } from "@angular/forms";
import { FileBundle } from "../../models/file-bundle";
import { SignPadDialog } from "../../sign-dialog/sign-dialog.component";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS, ApplicationType } from "../enums-list";
import * as moment from 'moment';
import { CrimeInfoHelper } from "./crime-information.helper";
import { config } from '../../../config';

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

    today = new Date();
    oneYearAgo = moment(new Date()).subtract(1, 'year');
    policeReportMinDates: Date[] = [];

    crimePeriodStartDate: Date = null;
    showWhyDidYouNotApplySooner: boolean = false;
    crimeInfoHelper = new CrimeInfoHelper();

    policeForceList = [];

    constructor(
        private controlContainer: ControlContainer,
        private matDialog: MatDialog,
        private fb: FormBuilder,
    ) {
        super();
    }

    ngOnInit() {
        this.form = <FormGroup>this.controlContainer.control;

        this.form.get('wasReportMadeToPolice').valueChanges.subscribe(value => {
            if (value === 100000001) {
                this.addPoliceReport();
            }
            else {
                this.removeAllPoliceReports();
            }
        });

        this.policeForceList = config.police_detachments;
    }

    addCrimeLocation(): void {
        this.crimeLocationItems = this.form.get('crimeLocations') as FormArray;
        this.crimeLocationItems.push(this.crimeInfoHelper.createCrimeLocationItem(this.fb));
        this.showAddCrimeLocation = this.crimeLocationItems.length < 5;
        this.showRemoveCrimeLocation = this.crimeLocationItems.length > 1;
    }

    removeCrimeLocation(index: number): void {
        this.crimeLocationItems = this.form.get('crimeLocations') as FormArray;
        this.crimeLocationItems.removeAt(index);
        this.showAddCrimeLocation = this.crimeLocationItems.length < 5;
        this.showRemoveCrimeLocation = this.crimeLocationItems.length > 1;
    }

    addPoliceReport(): void {
        this.policeReportItems = this.form.get('policeReports') as FormArray;
        this.policeReportItems.push(this.crimeInfoHelper.createPoliceReport(this.fb));
        this.showAddPoliceReport = this.policeReportItems.length < 5;
        this.showRemovePoliceReport = this.policeReportItems.length > 1;

        this.policeReportMinDates.push(null)
    }

    removePoliceReport(index: number): void {
        this.policeReportItems = this.form.get('policeReports') as FormArray;
        this.policeReportItems.removeAt(index);
        this.showAddPoliceReport = this.policeReportItems.length < 5;
        this.showRemovePoliceReport = this.policeReportItems.length > 1;
        this.policeReportMinDates.splice(index, 1);
    }

    removeAllPoliceReports() {
        this.policeReportItems = this.form.get('policeReports') as FormArray;
        while (this.policeReportItems.length !== 0) {
            this.policeReportItems.removeAt(0);
        }
        this.policeReportMinDates = [];
    }

    addCourtInfo(): void {
        this.courtFileItems = this.form.get('courtFiles') as FormArray;
        this.courtFileItems.push(this.crimeInfoHelper.createCourtInfoItem(this.fb));
        this.showAddCourtInfo = this.courtFileItems.length < 3;
        this.showRemoveCourtInfo = this.courtFileItems.length > 1;
    }

    removeCourtInfo(index: number): void {
        this.courtFileItems = this.form.get('courtFiles') as FormArray;
        this.courtFileItems.removeAt(index);
        this.showAddCourtInfo = this.courtFileItems.length < 3;
        this.showRemoveCourtInfo = this.courtFileItems.length > 1;
    }

    showSignPad(group, control): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;

        const dialogRef = this.matDialog.open(SignPadDialog, dialogConfig);
        dialogRef.afterClosed().subscribe(
            data => {
                var patchObject = {};
                patchObject[control] = data;
                this.form.get(group).patchValue(
                    patchObject
                );
            },
            err => console.log(err)
        );
    }

    crimePeriodStartChange(event: MatDatepickerInputEvent<Date>) {
        this.crimePeriodStartDate = event.target.value;
        //validate that a selected end date is not before the start date
        let startDate = moment(event.target.value);

        let endDate = this.form.get('crimePeriodEnd').value;
        if (endDate && moment(endDate).isBefore(startDate)) {
            this.form.get('crimePeriodEnd').patchValue(null);
        }

        this.showWhyDidYouNotApplySooner = moment(startDate).isBefore(this.oneYearAgo);
        this.form.get('applicationFiledWithinOneYearFromCrime').patchValue(!this.showWhyDidYouNotApplySooner);
    }

    whenDidCrimeOccurChange(event) {
        let crimePeriodEndControl = this.form.get('crimePeriodEnd');

        if (this.form.get('whenDidCrimeOccur').value) {
            crimePeriodEndControl.setValidators([Validators.required]);
            crimePeriodEndControl.markAsTouched();
            crimePeriodEndControl.updateValueAndValidity();
        }
        else {
            this.form.get('crimePeriodEnd').patchValue(null);
            crimePeriodEndControl.clearValidators();
            crimePeriodEndControl.setErrors(null);
            crimePeriodEndControl.markAsTouched();
            crimePeriodEndControl.updateValueAndValidity();
        }
    }

    reportStartChange(index: number, event: MatDatepickerInputEvent<Date>) {
        this.policeReportMinDates[index] = event.target.value;
        //validate that a selected end date is not before the start date
        let startDate = moment(event.target.value);
        this.policeReportItems = this.form.get('policeReports') as FormArray;
        let thisReport = this.policeReportItems.at(index) as FormGroup;
        let endDate = moment(thisReport.get('reportEndDate').value);
        if (endDate.isBefore(startDate)) {
            thisReport.get('reportEndDate').patchValue(null);
        }
    }

    clearReportEndDate(index: number) {
        this.policeReportItems = this.form.get('policeReports') as FormArray;
        let thisReport = this.policeReportItems.at(index) as FormGroup;

        if (thisReport.get('policeReportedMultipleTimes').value) {
            thisReport.get('reportEndDate').patchValue(null);
        }
    }

    policeForceSelected(index: number) {

    }

}