import { Component } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'application-success',
  templateUrl: './application-success.component.html',
  styleUrls: ['./application-success.component.scss']
})
export class ApplicationSuccessComponent {
  constructor(private router: Router) {
    this.router.navigateByUrl("/application-success");
    }
}
