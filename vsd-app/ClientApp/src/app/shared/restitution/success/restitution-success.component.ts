import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { HeaderTitleService } from '../../../services/titile.service';

@Component({
  selector: 'restitution-success',
  templateUrl: './restitution-success.component.html',
  styleUrls: ['./restitution-success.component.scss']
})
export class RestitutionSuccessComponent implements OnInit, OnDestroy {
  constructor(private router: Router, private headerTitleService: HeaderTitleService,) {
    this.router.navigateByUrl("/restitution-success");
  }

  ngOnDestroy() {
    this.headerTitleService.setTitle("Crime Victim Assistance Program");
  }

  ngOnInit() {
    this.headerTitleService.setTitle("Restitution Program");
  }
}
