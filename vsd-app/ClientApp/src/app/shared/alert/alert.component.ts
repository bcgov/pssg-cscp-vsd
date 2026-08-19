import { Component, Input } from '@angular/core';

export type AlertType = 'info' | 'success' | 'warning' | 'danger';

const ALERT_ICONS: Record<AlertType, string> = {
  info: '&#9432;',
  success: '&#10004;',
  warning: '&#9888;',
  danger: '&#10007;'
};

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  standalone: false
})
export class AlertComponent {
  @Input() message = '';
  @Input() type: AlertType = 'warning';
  dismissed = false;

  get icon(): string {
    return ALERT_ICONS[this.type];
  }

  get isVisible(): boolean {
    return !this.dismissed;
  }

  dismiss(): void {
    this.dismissed = true;

    // TODO: can be enhanced to pass event to parent component or service to handle dismissal state across the app if needed
  }
}
