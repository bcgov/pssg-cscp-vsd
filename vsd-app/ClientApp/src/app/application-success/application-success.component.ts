import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'application-success',
  templateUrl: './application-success.component.html',
  styleUrls: ['./application-success.component.scss'],
  standalone: false
})
export class ApplicationSuccessComponent {
  private readonly router = inject(Router);
  constructor() {
    this.router.navigateByUrl('/application-success');
  }
}
