import { Component } from '@angular/core';

@Component({
  selector: 'app-service-not-available',
  template: `
    <div class="service-error-message">
      <p>The Victim Safety Unit application is currently down. Please retry later or contact the Victim Safety Unit.</p>
    </div>
  `,
  styles: [
    `
      .service-error-message {
        color: white;
      }
      .service-error-message p {
        margin: 8px 0;
      }
      .service-error-message a {
        color: white;
        text-decoration: underline;
      }
    `
  ],
  standalone: false
})
export class ServiceNotAvailableComponent {
  constructor() {}
}
