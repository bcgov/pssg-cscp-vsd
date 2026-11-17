import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
/** NotFound component*/
export class NotFoundComponent {
  private readonly router = inject(Router);
  constructor() {
    this.router.navigateByUrl('/404');
  }
}
