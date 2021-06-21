import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { StateService } from '../../../services/state.service';
import { HeaderTitleService } from '../../../services/titile.service';
import { ResitutionForm } from '../../enums-list';

@Component({
  selector: 'restitution-success',
  templateUrl: './restitution-success.component.html',
  styleUrls: ['./restitution-success.component.scss']
})
export class RestitutionSuccessComponent implements OnInit, OnDestroy {
  constructor(private router: Router, private headerTitleService: HeaderTitleService, private state: StateService) {
    this.router.navigateByUrl("/restitution-success");
  }

  ngOnDestroy() {
    this.headerTitleService.setTitle("Crime Victim Assistance Program");
  }

  ngOnInit() {
    this.headerTitleService.setTitle("Restitution Program");
  }

  submitAnotherApplication() {
    this.state.cloning = true;
    let type = this.state.data.type;
    if (type.val === ResitutionForm.Victim.val) {
      this.router.navigate(['/victim-restitution']);
    }
    else if (type.val === ResitutionForm.Offender.val) {
      this.router.navigate(['/offender-restitution']);
    }
    else {
      //not implemented...
    }
  }
}
