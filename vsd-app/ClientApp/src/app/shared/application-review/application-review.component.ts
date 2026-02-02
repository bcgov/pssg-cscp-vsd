import { FormBase } from '../form-base';
import { OnInit, Component, Input } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { UntypedFormGroup, ControlContainer, UntypedFormArray } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS, ApplicationType, EnumHelper, OnBehalfOf, CRMBoolean, CRMMultiBoolean } from '../enums-list';
import { AddressHelper } from '../address/address.helper';

@Component({
  selector: 'app-application-review',
  templateUrl: './application-review.component.html',
  styleUrls: ['./application-review.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class ApplicationReviewComponent extends FormBase implements OnInit {
  @Input() formType: number;
  @Input() parentStepper: MatStepper;
  public form: UntypedFormGroup;
  ApplicationType = ApplicationType;
  CRMBoolean = CRMBoolean;
  CRMMultiBoolean = CRMMultiBoolean;
  OnBehalfOf = OnBehalfOf;
  enumHelper = new EnumHelper();

  courtFiles: UntypedFormArray;
  crimeLocations: UntypedFormArray;
  policeReports: UntypedFormArray;
  otherMedicalTreatments: UntypedFormArray;
  employers: UntypedFormArray;

  addressHelper = new AddressHelper();

  pages: any;

  constructor(private controlContainer: ControlContainer) {
    super();
  }

  ngOnInit() {
    this.form = <UntypedFormGroup>this.controlContainer.control;
    setTimeout(() => {
      this.form.markAsTouched();
    }, 0);
    this.crimeLocations = this.form.get('crimeInformation.crimeLocations') as UntypedFormArray;
    this.courtFiles = this.form.get('crimeInformation.courtFiles') as UntypedFormArray;
    this.policeReports = this.form.get('crimeInformation.policeReports') as UntypedFormArray;
    this.otherMedicalTreatments = this.form.get('medicalInformation.otherTreatments') as UntypedFormArray;
    if (this.formType === ApplicationType.Victim_Application) {
      this.employers = this.form.get('employmentIncomeInformation.employers') as UntypedFormArray;
      this.pages = VictimApplicationPages;
    }
    if (this.formType === ApplicationType.IFM_Application) {
      this.employers = this.form.get('expenseInformation.employers') as UntypedFormArray;
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
