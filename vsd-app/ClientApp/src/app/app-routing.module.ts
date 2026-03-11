import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplicationCancelledComponent } from './application-cancelled/application-cancelled.component';
import { ApplicationSelectorComponent } from './application-selector/application-selector.component';
import { ApplicationSuccessComponent } from './application-success/application-success.component';
import { DraftDashboardComponent } from './draft-dashboard/draft-dashboard.component';
import { authGuard } from './guards/auth.guard';
import { IfmApplicationComponent } from './ifm-application/ifm-application.component';
import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './login/login.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { SubmitInvoiceComponent } from './submit-invoice/submit-invoice.component';
import { VictimApplicationComponent } from './victim-application/victim-application.component';
import { WitnessApplicationComponent } from './witness-application/witness-application.component';

const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'drafts',
    component: DraftDashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'application-selector',
    component: ApplicationSelectorComponent
  },
  {
    path: 'victim-application',
    component: VictimApplicationComponent
  },
  {
    path: 'ifm-application',
    component: IfmApplicationComponent
  },
  {
    path: 'witness-application',
    component: WitnessApplicationComponent
  },
  {
    path: 'submit-invoice',
    component: SubmitInvoiceComponent
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
