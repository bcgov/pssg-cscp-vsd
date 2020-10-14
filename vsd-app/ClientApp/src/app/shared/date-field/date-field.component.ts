import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import * as moment from 'moment';

@Component({
    selector: 'app-date-field',
    templateUrl: './date-field.component.html',
    styleUrls: ['./date-field.component.scss']
})
export class DateFieldComponent implements OnInit {
    @Input() control: AbstractControl;
    @Input() max: Date;
    @Input() min: Date;
    dayList = [];
    yearList = [];

    day = 0;
    month = -1;
    year = 0;

    currentYear = new Date().getFullYear();

    constructor() { }

    ngOnInit() {
        let date: moment.Moment = this.control.value;
        if (date) {
            this.year = date.year();
            this.month = date.month();
            this.day = date.date();
        }

        for (let i = 1; i <= 31; ++i) {
            this.dayList.push(i);
        }

        for (let i = 0; i < 120; ++i) {
            this.yearList.push(this.currentYear - i);
        }
    }

    pad(num, size) {
        num = num.toString();
        while (num.length < size) num = "0" + num;
        return num;
    }

    output() {
        console.log(this.min);
        console.log(this.max);
        if (this.day == 0 || this.month == -1 || this.year == 0) {
            this.control.patchValue('');
            return;
        }

        this.control.markAsTouched();

        let hasMinError = false;
        let hasMaxError = false;

        let date = moment(new Date(this.year, this.month, this.day));
        if (this.min) {
            if (date.isBefore(moment(this.min))) {
                console.log("min error");
                console.log(date);
                console.log(moment(this.min));
                hasMinError = true;
                setTimeout(() => { this.control.setErrors({ 'incorrect': true }); }, 0);
            }
        }

        if (this.max) {
            if (date.isAfter(moment(this.max))) {
                console.log("max error");
                console.log(date);
                console.log(moment(this.max));
                hasMaxError = true;
                setTimeout(() => { this.control.setErrors({ 'incorrect': true }); }, 0);
            }
        }

        if (!hasMinError && !hasMaxError) {
            setTimeout(() => { this.control.setErrors(null); }, 0);
        }

        this.control.patchValue(date);
    }

}
