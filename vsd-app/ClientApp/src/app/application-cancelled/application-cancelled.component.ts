import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from "@angular/router";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'application-cancelled',
  templateUrl: './application-cancelled.component.html',
  styleUrls: ['./application-cancelled.component.scss']
})
export class ApplicationCancelledComponent implements OnInit {

  applicationType: string;

  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.navigateByUrl("/application-cancelled");
  }

  ngOnInit() {
    // Figure out how to get route data here and display the relevant components
//    const myData = this.route.snapshot.data['applicationType'];
//    this.applicationType = myData;
  }
}
