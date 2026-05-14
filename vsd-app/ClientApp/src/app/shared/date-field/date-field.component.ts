import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import moment from 'moment';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { MY_FORMATS } from '../enums-list';

@Component({
  selector: 'app-date-field',
  templateUrl: './date-field.component.html',
  styleUrls: ['./date-field.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ],
  standalone: false
})
export class DateFieldComponent implements OnInit, OnDestroy {
  @Input() control!: AbstractControl;
  @Input() max!: Date;
  @Input() min!: Date;
  @Input() disabled!: boolean;
  @Output() change = new EventEmitter<void>();

  private readonly destroy$ = new Subject<void>();

  get asFormControl(): FormControl {
    return this.control as FormControl;
  }

  ngOnInit(): void {
    // When a draft is loaded via patchValue, date values arrive as ISO strings.
    // Convert them to Moment objects so the Material DatePicker renders correctly.
    this.control.valueChanges
      .pipe(
        filter((v) => v && typeof v === 'string'),
        takeUntil(this.destroy$)
      )
      .subscribe((v) => {
        const m = moment(v);
        if (m.isValid()) {
          this.control.setValue(m, { emitEvent: false });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDateChange(): void {
    this.change.emit();
  }
}
