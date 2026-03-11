import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  standalone: false
})
export class LandingComponent {
  constructor(private titleService: Title, private router: Router) {
    this.titleService.setTitle('Welcome - Crime Victim Assistance Program');
  }

  signInWithBcServicesCard(): void {
    // TODO: Replace with BC Services Card / Keycloak authentication.
    this.router.navigate(['/login']);
  }

  continueAnonymously(): void {
    this.router.navigate(['/application-selector']);
  }
}
