import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
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

  constructor(private readonly dateAdapter: DateAdapter<unknown>) {}

  get asFormControl(): FormControl {
    return this.control as FormControl;
  }

  ngOnInit(): void {
    // When a draft is loaded via patchValue, date values arrive as ISO strings.
    // Deserialize via the adapter so the Material DatePicker receives the correct type.
    this.control.valueChanges
      .pipe(
        filter((v) => v && typeof v === 'string'),
        takeUntil(this.destroy$)
      )
      .subscribe((v) => {
        const d = this.dateAdapter.deserialize(v);
        if (d && this.dateAdapter.isValid(d)) {
          this.control.setValue(d, { emitEvent: false });
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
