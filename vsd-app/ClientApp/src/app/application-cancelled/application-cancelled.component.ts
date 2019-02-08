import { Component } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'application-cancelled',
  templateUrl: './application-cancelled.component.html',
  styleUrls: ['./application-cancelled.component.scss']
})
export class ApplicationCancelledComponent {
    /** NotFound ctor */
  constructor(private router: Router) {
    this.router.navigateByUrl("/application-cancelled");

    }
}
