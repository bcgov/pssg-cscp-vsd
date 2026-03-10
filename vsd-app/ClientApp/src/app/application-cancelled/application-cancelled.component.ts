import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LookupStore } from '../store/lookup.store';

@Component({
  selector: 'application-cancelled',
  templateUrl: './application-cancelled.component.html',
  styleUrls: ['./application-cancelled.component.scss'],
  standalone: false
})
export class ApplicationCancelledComponent implements OnInit {
  applicationType: string;
  protected readonly lookupStore = inject(LookupStore);
  get cvapEmail(): string { return this.lookupStore.cvapEmail(); }

  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.navigateByUrl('/application-cancelled');
  }

  ngOnInit() {
    // Figure out how to get route data here and display the relevant components
    //    const myData = this.route.snapshot.data['applicationType'];
    //    this.applicationType = myData;
  }
}
