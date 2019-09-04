import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  personalInfoForm: FormGroup;
  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.personalInfoForm = this.fb.group({
      primaryAddress: [null, Validators.required],
      alternateAddress: [null],
    });
  }

  submit() {
    console.log(`Value: ${this.personalInfoForm.controls.mySwitch.value}`);
  }
}
