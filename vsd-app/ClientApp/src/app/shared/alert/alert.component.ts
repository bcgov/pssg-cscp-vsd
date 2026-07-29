import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  standalone: false
})
export class AlertComponent {
  @Input() message = '';
  dismissed = false;

  get isVisible(): boolean {
    return !this.dismissed;
  }

  dismiss(): void {
    this.dismissed = true;

    // TODO: can be enhanced to pass event to parent component or service to handle dismissal state across the app if needed
  }
}
