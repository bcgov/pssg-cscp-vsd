import { Component } from '@angular/core';

@Component({
  selector: 'app-stepper-nav-tip',
  template: `
    <div class="stepper-nav-tip">
      <i class="fas fa-info-circle"></i>
      Click any step in the navigation above to jump directly to that section.
    </div>
  `,
  styles: [
    `
      .stepper-nav-tip {
        margin-top: 16px;
        padding: 8px 12px;
        background-color: #e8f4fd;
        border-left: 4px solid #1a73c2;
        border-radius: 4px;
        font-size: 0.875rem;
        color: #333;
      }
      .stepper-nav-tip i {
        color: #1a73c2;
        margin-right: 6px;
      }
    `
  ],
  standalone: false
})
export class StepperNavTipComponent {}
