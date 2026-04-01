import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { LookupStore } from '../store/lookup.store';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  standalone: false
})
export class LandingComponent {
  constructor(private titleService: Title, private router: Router, private loginService : LoginService) {
    this.titleService.setTitle('Welcome - Crime Victim Assistance Program');
  }

  signInWithBcServicesCard(): void {
    this.loginService.authorize();
  }

  continueAnonymously(): void {
    this.router.navigate(['/application']);
  }
}
