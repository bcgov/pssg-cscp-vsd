import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HealthCheckService } from '../services/health-check.service';

@Component({
  selector: 'app-outage',
  standalone: false,
  template: `
    <div class="outage-container">
      <div class="outage-content" role="main">
        <h1 class="outage-title">Service Temporarily Unavailable</h1>
        <p class="outage-footer">
          The Crime Victim Assistance Program (CVAP) application is currently down. Please retry later.
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .outage-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60vh;
        padding: 2rem;
        text-align: center;
      }
      .outage-checking {
        color: #6c757d;
        font-size: 1.1rem;
      }
      .outage-content {
        max-width: 600px;
        width: 100%;
      }
      .outage-icon {
        font-size: 4rem;
        color: #e3a008;
        margin-bottom: 1rem;
      }
      .outage-title {
        font-size: 2rem;
        font-weight: 700;
        color: #036;
        margin-bottom: 1.25rem;
      }
      .outage-message {
        font-size: 1.05rem;
        color: #333;
        margin-bottom: 0.75rem;
        line-height: 1.6;
      }
      .outage-actions {
        margin: 1.75rem 0;
      }
      .outage-actions .btn-primary {
        padding: 0.6rem 1.75rem;
        font-size: 1rem;
      }
      .outage-footer {
        margin-top: 1.5rem;
        font-size: 0.9rem;
      }
      .outage-footer a {
        color: #036;
        text-decoration: underline;
      }
      .outage-footer a:hover {
        color: #004f9f;
      }
    `
  ]
})
export class OutageComponent {
  private readonly healthCheckService = inject(HealthCheckService);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      if (this.healthCheckService.isHealthy()) {
        this.router.navigateByUrl('/');
      }
    });
  }
}
