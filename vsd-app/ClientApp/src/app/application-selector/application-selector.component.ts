import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormBase } from '../shared/form-base';

@Component({
  selector: 'app-application-selector',
  templateUrl: './application-selector.component.html',
  styleUrls: ['./application-selector.component.scss'],
  standalone: false
})
export class ApplicationSelectorComponent extends FormBase implements OnInit {
  window = window;
  busy: Subscription;

  public selectedApplicationType: number = 0;
  public selectedApplicationName: string = '';
  showValidationMessage: boolean = false;

  isIE: boolean = false;
  private readonly titleService = inject(Title);
  private readonly fb = inject(UntypedFormBuilder);
  private readonly router = inject(Router);
  constructor() {
    super();
  }

  ngOnInit() {
    var ua = window.navigator.userAgent;
    this.isIE = /MSIE|Trident/.test(ua);

    this.titleService.setTitle('Home - Crime Victim Assistance Program');

    this.form = this.fb.group({
      applicationType: ['0', Validators.required],
      completingOnBehalfOf: ['', Validators.required],
      wasCrimeInBC: ['', Validators.required]
    });

    this.form.valueChanges.subscribe(() => {
      this.showValidationMessage = this.hasInvalidTouchedControls(this.form);
    });
  }

  applicationTypeChanged(event) {
    var selection = parseInt(event.target.value.toLowerCase());

    this.selectedApplicationType = selection;
    this.selectedApplicationName = this.getApplicationName(selection).toUpperCase();

    this.form.get('completingOnBehalfOf').setValue('');
    this.form.get('completingOnBehalfOf').markAsUntouched();
    this.form.get('wasCrimeInBC').setValue('');
    this.form.get('wasCrimeInBC').markAsUntouched();

    this.showValidationMessage = false;
  }

  getApplicationName(applicationNumber: number): string {
    switch (applicationNumber) {
      case 100000002:
        return 'Victim Application';
      case 100000001:
        return 'Immediate Family Member Application';
      case 100000000:
        return 'Witness Application';
    }
    return '';
  }

  gotoApplication(): void {
    this.form.markAllAsTouched();

    if (this.form.valid && this.form.get('wasCrimeInBC').value === true) {
      this.showValidationMessage = false;
      let applicationType = parseInt(this.form.get('applicationType').value);
      let behalfOf = parseInt(this.form.get('completingOnBehalfOf').value);

      // Possibly a more correct way to do this.. NG Routing?
      let routeUrl = '';
      switch (applicationType) {
        case 100000002:
          routeUrl = '/application/victim';
          break;
        case 100000001:
          routeUrl = '/application/ifm';
          break;
        case 100000000:
          routeUrl = '/application/witness';
          break;
      }

      let navigationExtras: NavigationExtras = {
        queryParams: { ob: behalfOf }
      };

      this.router.navigate([routeUrl], navigationExtras);
    } else {
      this.showValidationMessage = true;
    }
  }
}
