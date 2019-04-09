import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { MatSnackBar } from '@angular/material';
import { FormBase } from '../shared/form-base';
import { EnumHelper } from '../shared/enums-list';

@Component({
  selector: 'app-ifm-review',
  templateUrl: './ifm-review.component.html',
  styleUrls: ['./ifm-review.component.scss'],
})

export class IfmReviewComponent extends FormBase implements OnInit {
  form: FormGroup;
  enumHelper = new EnumHelper();

  @Input() group: FormGroup;
  @Input() parentStepper: MatStepper;

  constructor(
    public snackBar: MatSnackBar,
  ) {
    super();
  }

  ngOnInit() {
    this.form = this.group;
  }
  
  gotoPageIndex(selectPage: number): void {
    window.scroll(0, 0);
    this.parentStepper.selectedIndex = selectPage;
  }
}
