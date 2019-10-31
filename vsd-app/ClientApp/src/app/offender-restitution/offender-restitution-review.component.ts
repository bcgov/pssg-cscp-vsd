import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { MatSnackBar } from '@angular/material';
import { FormBase } from '../shared/form-base';
import { EnumHelper } from '../shared/enums-list';

@Component({
  selector: 'app-offender-restitution-review',
  templateUrl: './offender-restitution-review.component.html',
  styleUrls: ['./offender-restitution-review.component.scss'],
})

export class OffenderRestitutionReviewComponent extends FormBase implements OnInit {
  form: FormGroup;
  enumHelper = new EnumHelper();

  @Input() group: FormGroup;
  @Input() parentStepper: MatStepper;
    
  restitutionCourtFiles: FormArray;
  
  constructor(
    public snackBar: MatSnackBar,
  ) {
    super();
  }

  ngOnInit() {
    this.form = this.group;
    this.restitutionCourtFiles = this.form.get('restitutionInformation.restitutionCourtFiles') as FormArray;
  }
  
  gotoPageIndex(selectPage: number): void {
    window.scroll(0, 0);
    this.parentStepper.selectedIndex = selectPage;
  }
}
