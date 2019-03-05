import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VictimApplicationComponent } from './victim-application/victim-application.component';
import { SubmitInvoiceComponent } from './submit-invoice/submit-invoice.component';
import { ApplicationSuccessComponent } from './application-success/application-success.component';
import { ApplicationCancelledComponent } from './application-cancelled/application-cancelled.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { TestApiComponent } from './test-api/test-api.component';

const routes: Routes = [
  {
    path: '',
    component: VictimApplicationComponent
  },
  {
    path: 'victim-application',
    component: VictimApplicationComponent,
  },
  {
    path: 'submit-invoice',
    component: SubmitInvoiceComponent,
  },
  {
    path: 'test-api',
    component: TestApiComponent,
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
