import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigStore } from '../store/config.store';

@Component({
  selector: 'app-maintenance',
  standalone: false,
  template: `
    <div class="maintenance-container">
      <div class="maintenance-content" role="main">
        <h1 class="maintenance-title">Scheduled Maintenance</h1>
        <!-- @if (outageMessage()) {
          <p class="maintenance-message">{{ outageMessage() }}</p>
        } @else { -->
          <p class="maintenance-message">
            The Crime Victim Assistance Program (CVAP) application is currently undergoing scheduled maintenance. Please
            try again later.
          </p>
        <!-- } -->
        <p class="maintenance-footer">We apologize for the inconvenience and appreciate your patience.</p>
      </div>
    </div>
  `,
  styles: [
    `
      .maintenance-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60vh;
        padding: 2rem;
        text-align: center;
      }
      .maintenance-content {
        max-width: 600px;
        width: 100%;
      }
      .maintenance-title {
        font-size: 2rem;
        font-weight: 700;
        color: #036;
        margin-bottom: 1.25rem;
      }
      .maintenance-message {
        font-size: 1.05rem;
        color: #333;
        margin-bottom: 0.75rem;
        line-height: 1.6;
      }
      .maintenance-footer {
        margin-top: 1.5rem;
        font-size: 0.9rem;
        color: #6c757d;
      }
    `
  ]
})
export class MaintenanceComponent {
  protected readonly outageMessage = inject(ConfigStore).outageMessage;

  constructor() {
    const configStore = inject(ConfigStore);
    const router = inject(Router);

    effect(() => {
      if (!configStore.maintenanceMode()) {
        router.navigateByUrl('/');
      }
    });
  }
}
