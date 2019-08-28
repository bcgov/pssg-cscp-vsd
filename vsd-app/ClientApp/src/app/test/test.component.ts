import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  form: FormGroup = null;

  constructor(
    private fb: FormBuilder,
  ) { }
  ngOnInit() {
    this.initializeForm();
  }
  initializeForm() {
    this.form = this.fb.group({
      employmentIncomeInformation: [null, Validators.required]
    })
  }
}
