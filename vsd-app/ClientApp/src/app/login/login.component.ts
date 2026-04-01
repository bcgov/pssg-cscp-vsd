import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LocalAuthService } from '../services/local-auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(private authService: LocalAuthService, private router: Router) {
    // If already logged in, skip straight to drafts dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/drafts']);
    }
  }

  async onSubmit(): Promise<void> {
    this.errorMessage = '';
    this.loading = true;

    const result = await this.authService.login(this.username, this.password);

    this.loading = false;

    if (result.success) {
      this.router.navigate(['/drafts']);
    } else {
      this.errorMessage = result.error ?? 'Invalid username or password.';
    }
  }
}
