import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { MatSnackBar } from '@angular/material';
import { FormBase } from '../shared/form-base';
import { EnumHelper } from '../shared/enums-list';

@Component({
  selector: 'app-witness-review',
  templateUrl: './witness-review.component.html',
  styleUrls: ['./witness-review.component.scss'],
})

export class WitnessReviewComponent extends FormBase implements OnInit {
  form: FormGroup;
  enumHelper = new EnumHelper();

  @Input() group: FormGroup;
  @Input() parentStepper: MatStepper;

  courtFiles: FormArray;
  crimeLocations: FormArray;
  policeReports: FormArray;
  otherMedicalTreatments: FormArray;
  employers: FormArray;

  constructor(
    public snackBar: MatSnackBar,
  ) {
    super();
  }

  ngOnInit() {
    this.form = this.group;
    this.crimeLocations = this.form.get('crimeInformation.crimeLocations') as FormArray;
    this.courtFiles = this.form.get('crimeInformation.courtFiles') as FormArray;
    this.policeReports = this.form.get('crimeInformation.policeReports') as FormArray;
    this.otherMedicalTreatments = this.form.get('medicalInformation.otherTreatments') as FormArray;
    this.employers = this.form.get('expenseInformation.employers') as FormArray;
  }
  
  gotoPageIndex(selectPage: number): void {
    window.scroll(0, 0);
    this.parentStepper.selectedIndex = selectPage;
  }
}
