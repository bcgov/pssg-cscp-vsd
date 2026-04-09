import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplicationCancelledComponent } from './application-cancelled/application-cancelled.component';
import { ApplicationSelectorComponent } from './application-selector/application-selector.component';
import { ApplicationSuccessComponent } from './application-success/application-success.component';
import { DraftDashboardComponent } from './draft-dashboard/draft-dashboard.component';
import { authFeatureGuard, authGuard } from './guards/authentication-feature.guard';
import { IfmApplicationComponent } from './ifm-application/ifm-application.component';
import { LandingComponent } from './landing/landing.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { SubmitInvoiceComponent } from './submit-invoice/submit-invoice.component';
import { VictimApplicationComponent } from './victim-application/victim-application.component';
import { WitnessApplicationComponent } from './witness-application/witness-application.component';

const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    canActivate: [authFeatureGuard]
  },
  {
    path: 'drafts',
    component: DraftDashboardComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Drafts' }
  },
  {
    path: 'application',
    children: [
      {
        path: '',
        component: ApplicationSelectorComponent,
        data: { breadcrumb: 'Application Selector' }
      },
      {
        path: 'victim',
        component: VictimApplicationComponent,
        data: { breadcrumb: 'Victim Application' }
      },
      {
        path: 'ifm',
        component: IfmApplicationComponent,
        data: { breadcrumb: 'Family Member Application' }
      },
      {
        path: 'witness',
        component: WitnessApplicationComponent,
        data: { breadcrumb: 'Witness Application' }
      }
    ]
  },
  {
    path: 'submit-invoice',
    component: SubmitInvoiceComponent,
    data: { breadcrumb: 'Submit Invoice' }
  },
  {
    path: 'application-cancelled',
    component: ApplicationCancelledComponent
  },
  {
    path: 'application-success',
    component: ApplicationSuccessComponent
  },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule {}
