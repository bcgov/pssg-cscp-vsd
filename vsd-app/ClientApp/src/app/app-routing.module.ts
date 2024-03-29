import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { VictimApplicationComponent } from './victim-application/victim-application.component';
import { IfmApplicationComponent } from './ifm-application/ifm-application.component';
import { WitnessApplicationComponent } from './witness-application/witness-application.component';
import { SubmitInvoiceComponent } from './submit-invoice/submit-invoice.component';
import { ApplicationSuccessComponent } from './application-success/application-success.component';
import { ApplicationCancelledComponent } from './application-cancelled/application-cancelled.component';
import { NotFoundComponent } from './not-found/not-found.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'victim-application',
    component: VictimApplicationComponent,
  },
  {
    path: 'ifm-application',
    component: IfmApplicationComponent,
  },
  {
    path: 'witness-application',
    component: WitnessApplicationComponent,
  },
  {
    path: 'submit-invoice',
    component: SubmitInvoiceComponent,
  },
  {
    path: 'application-cancelled',
    component: ApplicationCancelledComponent,
  },
  {
    path: 'application-success',
    component: ApplicationSuccessComponent,
  },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
