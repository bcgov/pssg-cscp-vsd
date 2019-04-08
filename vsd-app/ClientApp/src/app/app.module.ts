import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { AppRoutingModule } from './app-routing.module';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';
import { CdkTableModule } from '@angular/cdk/table';
import { AccountDataService } from './services/account-data.service';
import { JusticeApplicationDataService } from './services/justice-application-data.service';
import { ContactDataService } from './services/contact-data.service';
import { ApplicationDataService } from './services/adoxio-application-data.service';
import { AdoxioLegalEntityDataService } from './services/adoxio-legal-entity-data.service';
import { AdoxioLicenseDataService } from './services/adoxio-license-data.service';
import { PaymentDataService } from './services/payment-data.service';
import { AppComponent } from './app.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { DynamicsDataService } from './services/dynamics-data.service';
import { StaticComponent } from './static/static.component';
import { HomeComponent } from './home/home.component';
import { SurveyDataService } from './services/survey-data.service';
import { UserDataService } from './services/user-data.service';
import { VersionInfoDataService } from './services/version-info-data.service';
import { NotFoundComponent } from './not-found/not-found.component';
import { BusinessProfileComponent } from './business-information/business-profile/business-profile.component';
import { AddressComponent } from './shared/address/address.component';
import { SignPadDialog } from './sign-dialog/sign-dialog.component';
import { SummaryOfBenefitsDialog } from './summary-of-benefits/summary-of-benefits.component';
import { VictimApplicationComponent } from './victim-application/victim-application.component';
import { VictimReviewComponent } from './victim-application/victim-review.component';
import { IfmApplicationComponent } from './ifm-application/ifm-application.component';
import { IfmReviewComponent } from './ifm-application/ifm-review.component';
import { WitnessApplicationComponent } from './witness-application/witness-application.component';
import { WitnessReviewComponent } from './witness-application/witness-review.component';
import { ApplicationSuccessComponent } from './application-success/application-success.component';
import { ApplicationCancelledComponent } from './application-cancelled/application-cancelled.component';
import { SubmitInvoiceComponent } from './submit-invoice/submit-invoice.component';
import { TestApiComponent } from './test-api/test-api.component';
import { FileDropModule } from 'ngx-file-drop';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FileUploaderComponent } from './shared/file-uploader/file-uploader.component';
import { NgBusyModule } from 'ng-busy';
import { BsDatepickerModule, AlertModule } from 'ngx-bootstrap';
import { BCeidAuthGuard } from './services/bceid-auth-guard.service';
import { metaReducers, reducers } from './app-state/reducers/reducers';
import { StoreModule } from '@ngrx/store';
import { TermsAndConditionsComponent } from './lite/terms-and-conditions/terms-and-conditions.component';
import { AliasDataService } from './services/alias-data.service';
import { FieldComponent } from './shared/field/field.component';
import { QuickExitComponent } from './quick-exit/quick-exit.component';
import { ToolTipTriggerComponent } from './shared/tool-tip/tool-tip.component';
import { ProfileSummaryComponent } from './business-information/profile-summary/profile-summary.component';
import { VersionInfoDialog } from './version-info/version-info.component';
import { SignaturePadModule } from 'angular2-signaturepad';

@NgModule({
  declarations: [
    AppComponent,
    BusinessProfileComponent,
    AddressComponent,
    SignPadDialog,
    SummaryOfBenefitsDialog,
    VictimApplicationComponent,
    VictimReviewComponent,
    IfmApplicationComponent,
    IfmReviewComponent,
    WitnessApplicationComponent,
    WitnessReviewComponent,
    ApplicationSuccessComponent,
    ApplicationCancelledComponent,
    SubmitInvoiceComponent,
    TestApiComponent,
    BreadcrumbComponent,
    HomeComponent,
    NotFoundComponent,
    StaticComponent,
    FileUploaderComponent,
    FieldComponent,
    QuickExitComponent,
    ToolTipTriggerComponent,
    ProfileSummaryComponent,
    TermsAndConditionsComponent,
    VersionInfoDialog,    
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgBusyModule,
    CdkTableModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    FileDropModule,
    SignaturePadModule,
    TooltipModule.forRoot(),
    BsDatepickerModule.forRoot(),
    StoreModule.forRoot(reducers, { metaReducers }),
    AlertModule.forRoot()
  ],
  exports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CdkTableModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    FileDropModule,
    TooltipModule,
    MatTooltipModule
  ],
  providers: [
    CookieService,
    DynamicsDataService,
    SurveyDataService,
    UserDataService,
    AliasDataService,
    ApplicationDataService,
    AdoxioLegalEntityDataService,
    AdoxioLicenseDataService,
    AccountDataService,
    JusticeApplicationDataService,
    ContactDataService,
    PaymentDataService,
    Title,
    VersionInfoDataService,
    BCeidAuthGuard,
  ],
  entryComponents: [
    VersionInfoDialog,
    SignPadDialog,
    SummaryOfBenefitsDialog
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
