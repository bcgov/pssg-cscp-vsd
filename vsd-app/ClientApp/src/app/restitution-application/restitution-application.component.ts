import { AEMService } from '../services/aem.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationType, IOptionSetVal, MY_FORMATS } from '../shared/enums-list';
import { CancelDialog } from '../shared/dialogs/cancel/cancel.dialog';
import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { FormBase } from "../shared/form-base";
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { JusticeApplicationDataService } from '../services/justice-application-data.service';
import { LookupService } from '../services/lookup.service';
import { MatSnackBar, MatDialog, MatVerticalStepper } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { RestitutionInfoHelper } from '../shared/restitution/restitution-information/restitution-information.helper';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { StateService } from '../services/state.service';
import { config } from '../../config';
import { iLookupData } from '../interfaces/lookup-data.interface';
import { HeaderTitleService } from '../services/titile.service';
import { convertRestitutionToCRM } from './restitution.to.crm';
import { iRestitutionApplication } from '../interfaces/restitution.interface';

export enum RESTITUTION_PAGES {
    OVERVIEW,
    RESTITUTION_INFORMATION,
    REVIEW,
    CONFIRMATION
}

@Component({
    selector: 'app-restitution-application',
    templateUrl: './restitution-application.component.html',
    styleUrls: ['./restitution-application.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
        { provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true } },
    ],
})
export class RestitutionApplicationComponent extends FormBase implements OnInit, OnDestroy {
    @ViewChild('stepper') restitutionStepper: MatVerticalStepper;
    FORM_TYPE: IOptionSetVal = { val: -1, name: '' };
    ApplicationType = ApplicationType;
    isIE: boolean = false;
    didLoad: boolean = false;
    submitting: boolean = false;
    public showPrintView: boolean = false;

    PAGES = RESTITUTION_PAGES;

    lookupData: iLookupData = {
        countries: [],
        provinces: [],
        cities: [],
    };

    courtList: string[] = [];

    restitutionInfoHelper = new RestitutionInfoHelper();

    constructor(
        private justiceDataService: JusticeApplicationDataService,
        public fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        public snackBar: MatSnackBar,
        private matDialog: MatDialog,
        public state: StateService,
        public lookupService: LookupService,
        private aemService: AEMService,
        private headerTitleService: HeaderTitleService,
    ) {
        super();
    }

    ngOnDestroy() {
        this.headerTitleService.setTitle("Crime Victim Assistance Program");
    }

    ngOnInit() {
        var ua = window.navigator.userAgent;
        this.isIE = /MSIE|Trident/.test(ua);
        let form_type = this.route.snapshot.data['formType'];
        if (form_type) {
            this.FORM_TYPE = form_type;
        }
        this.headerTitleService.setTitle("Restitution Program");
        this.form = this.buildApplicationForm();

        let promise_array = [];

        promise_array.push(new Promise<void>((resolve, reject) => {
            this.lookupService.getCountries().subscribe((res) => {
                this.lookupData.countries = res.value;
                if (this.lookupData.countries) {
                    this.lookupData.countries.sort((a, b) => a.vsd_name.localeCompare(b.vsd_name));
                }
                resolve();
            });
        }));

        promise_array.push(new Promise<void>((resolve, reject) => {
            this.lookupService.getProvinces().subscribe((res) => {
                this.lookupData.provinces = res.value;
                if (this.lookupData.provinces) {
                    this.lookupData.provinces.sort((a, b) => a.vsd_name.localeCompare(b.vsd_name));
                }
                resolve();
            });
        }));

        promise_array.push(new Promise<void>((resolve, reject) => {
            this.lookupService.getCitiesByProvince(config.canada_crm_id, config.bc_crm_id).subscribe((res) => {
                this.lookupData.cities = res.value;
                if (this.lookupData.cities) {
                    this.lookupData.cities.sort((a, b) => a.vsd_name.localeCompare(b.vsd_name));
                }
                resolve();
            });
        }));

        Promise.all(promise_array).then((res) => {
            this.didLoad = true;
            console.log("Lookup data");
            console.log(this.lookupData);
        });
    }

    buildApplicationForm(FORM: IOptionSetVal = this.FORM_TYPE): FormGroup {
        let group = {
            introduction: this.fb.group({}),
            restitutionInformation: this.restitutionInfoHelper.setupFormGroup(this.fb, FORM),
        };

        return this.fb.group(group);
    }

    harvestForm(): iRestitutionApplication {
        let data = {
            ApplicationType: this.FORM_TYPE,
            RestitutionInformation: this.form.get('restitutionInformation').value,
        } as iRestitutionApplication;

        return data;
    }

    submitApplication() {
        this.submitting = true;
        if (this.form.valid) {
            let form = this.harvestForm();
            let data = convertRestitutionToCRM(form);
            this.justiceDataService.submitRestitutionApplication(data)
                .subscribe(
                    data => {
                        if (data['IsSuccess'] == true) {
                            this.submitting = false;
                            this.router.navigate(['/restitution-success']);
                        }
                        else {
                            this.submitting = false;
                            this.snackBar.open('Error submitting application. ' + data['message'], 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
                            if (this.isIE) {
                                alert("Encountered an error. Please use another browser as this may resolve the problem.")
                            }
                        }
                    },
                    error => {
                        this.submitting = false;
                        this.snackBar.open('Error submitting application', 'Fail', { duration: 3500, panelClass: ['red-snackbar'] });
                        if (this.isIE) {
                            alert("Encountered an error. Please use another browser as this may resolve the problem.")
                        }
                    }
                );
        } else {
            this.submitting = false;
            console.log("form not validated");
            this.markAsTouched();
        }
    }

    verifyCancellation(): void {
        let self = this;
        let dialogRef = this.matDialog.open(CancelDialog, {
            autoFocus: false,
            data: { type: "Application" }
        });

        dialogRef.afterClosed().subscribe((res: any) => {
            if (res.cancel) {
                self.router.navigate(['/application-cancelled']);
            }
        });
    }

    printApplication() {
        window.scroll(0, 0);
        this.showPrintView = true;
        document.querySelectorAll(".slide-close")[0].classList.add("hide-for-print");
        setTimeout(() => {
            window.print();
        }, 100);
    }

    @HostListener('window:afterprint')
    onafterprint() {
        document.querySelectorAll(".slide-close")[0].classList.remove("hide-for-print")
        window.scroll(0, 0);
        this.showPrintView = false;
    }

}