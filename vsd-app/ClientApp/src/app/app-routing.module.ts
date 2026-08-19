import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplicationCancelledComponent } from './application-cancelled/application-cancelled.component';
import { ApplicationSelectorComponent } from './application-selector/application-selector.component';
import { ApplicationSuccessComponent } from './application-success/application-success.component';
import { DraftDashboardComponent } from './draft-dashboard/draft-dashboard.component';
import { authFeatureGuard, authGuard } from './guards/authentication-feature.guard';
import { healthCheckGuard } from './guards/health-check.guard';
import { maintenanceGuard } from './guards/maintenance.guard';
import { IfmApplicationComponent } from './ifm-application/ifm-application.component';
import { LandingComponent } from './landing/landing.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { OutageComponent } from './outage/outage.component';
import { SubmitInvoiceComponent } from './submit-invoice/submit-invoice.component';
import { VictimApplicationComponent } from './victim-application/victim-application.component';
import { WitnessApplicationComponent } from './witness-application/witness-application.component';

const routes: Routes = [
  {
    path: 'outage',
    component: OutageComponent
  },
  {
    path: 'maintenance',
    component: MaintenanceComponent
  },
  {
    path: '',
    component: LandingComponent,
    canActivate: [healthCheckGuard, maintenanceGuard, authFeatureGuard]
  },
  {
    path: 'drafts',
    component: DraftDashboardComponent,
    canActivate: [healthCheckGuard, maintenanceGuard, authGuard],
    data: { breadcrumb: 'Drafts' }
  },
  {
    path: 'application',
    canActivate: [healthCheckGuard, maintenanceGuard],
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
    canActivate: [healthCheckGuard, maintenanceGuard],
    data: { breadcrumb: 'Submit Invoice' }
  },
  {
    path: 'application-cancelled',
    component: ApplicationCancelledComponent,
    canActivate: [healthCheckGuard, maintenanceGuard]
  },
  {
    path: 'application-success',
    component: ApplicationSuccessComponent,
    canActivate: [healthCheckGuard, maintenanceGuard]
  },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule {}
