import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BusinessProfileComponent } from './business-information/business-profile/business-profile.component';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { CanDeactivateGuard } from './services/can-deactivate-guard.service';
import { BCeidAuthGuard } from './services/bceid-auth-guard.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileSummaryComponent } from './business-information/profile-summary/profile-summary.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'business-profile',
    component: BusinessProfileComponent,
    canActivate: [BCeidAuthGuard]
  },
  {
    path: 'business-profile-review',
    component: ProfileSummaryComponent,
    canActivate: [BCeidAuthGuard]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [BCeidAuthGuard]
  },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
