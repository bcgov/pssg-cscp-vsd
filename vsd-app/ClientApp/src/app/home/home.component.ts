import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';
import { FormBase } from '../shared/form-base';
import { CanDeactivateGuard } from '../services/can-deactivate-guard.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends FormBase implements OnInit {
  window = window;
  busy: Subscription;

  public selectedApplicationType: number = 0;
  public selectedApplicationName: string;
  showValidationMessage: boolean;

  isLocalHost: boolean = false;

  constructor(
    private titleService: Title,
    private fb: FormBuilder,
    private router: Router) {
    super();
  }

  ngOnInit() {
    if (window.location.origin === "http://localhost:5000") {
      this.isLocalHost = true;
    }

    this.titleService.setTitle('Home - Crime Victim Assistance Program');

    this.form = this.fb.group({
      applicationType: ['0', Validators.required],
      completingOnBehalfOf: ['', Validators.required],
      wasCrimeInBC: ['', Validators.required],
    });
  }

  updateForm(event) {
    var selection = parseInt(event.target.value.toLowerCase());

    this.selectedApplicationType = selection;
    this.selectedApplicationName = this.getApplicationName(selection).toUpperCase();

    this.form.get('completingOnBehalfOf').setValue('');
    this.form.get('wasCrimeInBC').setValue('');
  }

  canProceedWithApplication(): boolean {
    let applicationType = parseInt(this.form.get('applicationType').value) > 0;
    let behalfOf = parseInt(this.form.get('completingOnBehalfOf').value) > 0;
    let isInBc = this.form.get('wasCrimeInBC').value === true;

    return applicationType && behalfOf && isInBc;
  }

  getApplicationName(applicationNumber: number): string {
    switch (applicationNumber) {
      case 100000002:
        return 'Victim Application';
      case 100000001:
        return 'Family Member Application';
      case 100000000:
        return 'Witness Application';
    }
    return '';
  }

  // marking the form as touched makes the validation messages show
  markAsTouched() {
    this.form.markAsTouched();
  }

  gotoApplication(): void {
    if (this.form.valid && this.form.get('wasCrimeInBC').value === true) {
      this.showValidationMessage = false;
      let applicationType = parseInt(this.form.get('applicationType').value);
      let behalfOf = parseInt(this.form.get('completingOnBehalfOf').value);

      // Possibly a more correct way to do this.. NG Routing?
      let routeUrl = '';
      switch (applicationType) {
        case 100000002:
          routeUrl = '/victim-application';
          break;
        case 100000001:
          routeUrl = '/ifm-application';
          break;
        case 100000000:
          routeUrl = '/witness-application';
          break;
      }

      console.log(applicationType);
      let navigationExtras: NavigationExtras = {
        queryParams: { 'ob': behalfOf }
      };

      this.router.navigate([routeUrl], navigationExtras);
    } else {
      this.showValidationMessage = true;
      console.log("form not validated");
    }
  }
}
