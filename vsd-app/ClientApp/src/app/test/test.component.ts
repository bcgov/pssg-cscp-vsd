import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  applicationForm: FormGroup;
  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.applicationForm = this.fb.group({
      personalInformation: ['']
    });
  }

  submit() {
    // console.log(`Value: ${this.applicationForm.controls.mySwitch.value}`);
  }
}
