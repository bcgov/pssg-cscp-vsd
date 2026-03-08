import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LookupService } from '../../api/lookup/lookup.service';

@Component({
  selector: 'application-cancelled',
  templateUrl: './application-cancelled.component.html',
  styleUrls: ['./application-cancelled.component.scss'],
  standalone: false
})
export class ApplicationCancelledComponent implements OnInit {
  applicationType: string;
  cvapEmail: string = '';

  constructor(private router: Router, private route: ActivatedRoute, private lookupService: LookupService) {
    this.router.navigateByUrl('/application-cancelled');
  }

  ngOnInit() {
    // Figure out how to get route data here and display the relevant components
    //    const myData = this.route.snapshot.data['applicationType'];
    //    this.applicationType = myData;
    this.lookupService.getApiLookupCvapEmails().subscribe((res) => {
      if (res) this.cvapEmail = res.cvapEmail;
    });
  }
}
