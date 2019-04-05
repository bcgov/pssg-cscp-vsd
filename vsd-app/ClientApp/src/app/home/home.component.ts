import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subscription, Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators, FormArray, ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { FormBase } from '../shared/form-base';

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

  constructor(
    private titleService: Title,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute)
  {
    super();
  }

  ngOnInit() {
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

  canProceedWithApplication() : boolean {
    let applicationType = parseInt(this.form.get('applicationType').value) > 0; 
    let behalfOf = parseInt(this.form.get('completingOnBehalfOf').value) > 0;
    let isInBc = this.form.get('wasCrimeInBC').value === true;

    return applicationType && behalfOf && isInBc;
  }

  getApplicationName(applicationNumber: number) : string {
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

  gotoApplication() : void {
    if (this.form.valid) {
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
          routeUrl = '/victim-application';
          break;
      }

      console.log(applicationType);
      let navigationExtras: NavigationExtras = {
        queryParams: { 'ob': behalfOf }
      };

      this.router.navigate([routeUrl], navigationExtras);
    } else {
      console.log("form not validated");
    }
  }
}
