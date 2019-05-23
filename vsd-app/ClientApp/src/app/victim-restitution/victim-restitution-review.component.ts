import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { MatSnackBar } from '@angular/material';
import { FormBase } from '../shared/form-base';
import { EnumHelper } from '../shared/enums-list';

@Component({
  selector: 'app-victim-restitution-review',
  templateUrl: './victim-restitution-review.component.html',
  styleUrls: ['./victim-restitution-review.component.scss'],
})

export class VictimRestitutionReviewComponent extends FormBase implements OnInit {
  form: FormGroup;
  enumHelper = new EnumHelper();

  @Input() group: FormGroup;
  @Input() parentStepper: MatStepper;
    
  courtFiles: FormArray;
  
  constructor(
    public snackBar: MatSnackBar,
  ) {
    super();
  }

  ngOnInit() {
    this.form = this.group;
    this.courtFiles = this.form.get('restitutionInformation.courtFiles') as FormArray;
  }
  
  gotoPageIndex(selectPage: number): void {
    window.scroll(0, 0);
    this.parentStepper.selectedIndex = selectPage;
  }
}
