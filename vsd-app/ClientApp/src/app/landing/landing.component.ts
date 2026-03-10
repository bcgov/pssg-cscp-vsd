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
    // BC Services Card authentication will be implemented in a future iteration.
    // Placeholder: navigate to the BC Services Card login URL.
    console.log('BC Services Card authentication is not yet implemented.');
  }

  continueAnonymously(): void {
    this.router.navigate(['/home']);
  }
}
