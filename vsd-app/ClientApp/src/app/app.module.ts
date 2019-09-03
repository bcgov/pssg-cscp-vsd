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
import { JusticeApplicationDataService } from './services/justice-application-data.service';
import { AppComponent } from './app.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
//import { DynamicsDataService } from './services/dynamics-data.service';
import { CanDeactivateGuard } from './services/can-deactivate-guard.service';
import { StaticComponent } from './static/static.component';
import { HomeComponent } from './home/home.component';
import { VersionInfoDataService } from './services/version-info-data.service';
import { NotFoundComponent } from './not-found/not-found.component';
import { AddressComponent } from './shared/address/address.component';
import { SignPadDialog } from './sign-dialog/sign-dialog.component';
import { SummaryOfBenefitsDialog } from './summary-of-benefits/summary-of-benefits.component';
import { CancelApplicationDialog } from './shared/cancel-dialog/cancel-dialog.component';
import { DeactivateGuardDialog } from './shared/guard-dialog/guard-dialog.component';
import { VictimApplicationComponent } from './victim-application/victim-application.component';
import { VictimReviewComponent } from './victim-application/victim-review.component';
import { IfmApplicationComponent } from './ifm-application/ifm-application.component';
import { IfmReviewComponent } from './ifm-application/ifm-review.component';
import { WitnessApplicationComponent } from './witness-application/witness-application.component';
import { WitnessReviewComponent } from './witness-application/witness-review.component';
import { ApplicationSuccessComponent } from './application-success/application-success.component';
import { ApplicationCancelledComponent } from './application-cancelled/application-cancelled.component';
import { SubmitInvoiceComponent } from './submit-invoice/submit-invoice.component';
import { VictimRestitutionComponent } from './victim-restitution/victim-restitution.component';
import { VictimRestitutionReviewComponent } from './victim-restitution/victim-restitution-review.component';
import { OffenderRestitutionComponent } from './offender-restitution/offender-restitution.component';
import { OffenderRestitutionReviewComponent } from './offender-restitution/offender-restitution-review.component';
import { FileDropModule } from 'ngx-file-drop';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FileUploaderComponent } from './shared/file-uploader/file-uploader.component';
import { NgBusyModule } from 'ng-busy';
import { BsDatepickerModule, AlertModule, BsDropdownModule } from 'ngx-bootstrap';
//import { IntlTelInputNgModule } from 'intl-tel-input-ng';
//import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { TermsAndConditionsComponent } from './lite/terms-and-conditions/terms-and-conditions.component';
import { AliasDataService } from './services/alias-data.service';
import { FieldComponent } from './shared/field/field.component';
import { QuickExitComponent } from './quick-exit/quick-exit.component';
import { ToolTipTriggerComponent } from './shared/tool-tip/tool-tip.component';
import { VersionInfoDialog } from './version-info/version-info.component';
import { SignaturePadModule } from 'angular2-signaturepad';
import { TestComponent } from './test/test.component';
import { FileUploaderBoxComponent } from './file-uploader-box/file-uploader-box.component';
import { EmploymentIncomeComponent } from './employment-income/employment-income.component';
import { ContactInformationComponent } from './contact-information/contact-information.component';
import { AddressBlockComponent } from './address-block/address-block.component';

@NgModule({
  declarations: [
    AppComponent,
    AddressComponent,
    SignPadDialog,
    SummaryOfBenefitsDialog,
    CancelApplicationDialog,
    DeactivateGuardDialog,
    VictimApplicationComponent,
    VictimReviewComponent,
    IfmApplicationComponent,
    IfmReviewComponent,
    WitnessApplicationComponent,
    WitnessReviewComponent,
    ApplicationSuccessComponent,
    ApplicationCancelledComponent,
    SubmitInvoiceComponent,
    VictimRestitutionComponent,
    VictimRestitutionReviewComponent,
    OffenderRestitutionComponent,
    OffenderRestitutionReviewComponent,
    BreadcrumbComponent,
    HomeComponent,
    NotFoundComponent,
    StaticComponent,
    FileUploaderComponent,
    FieldComponent,
    QuickExitComponent,
    ToolTipTriggerComponent,
    TermsAndConditionsComponent,
    VersionInfoDialog,
    TestComponent,
    FileUploaderBoxComponent,
    EmploymentIncomeComponent,
    ContactInformationComponent,
    AddressBlockComponent,
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
    //IntlTelInputNgModule.forRoot(),
    //NgxIntlTelInputModule,
    TooltipModule.forRoot(),
    //    BsDropdownModule.forRoot(),
    BsDatepickerModule.forRoot(),
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
    CanDeactivateGuard,
    AliasDataService,
    JusticeApplicationDataService,
    Title,
    VersionInfoDataService,
  ],
  entryComponents: [
    VersionInfoDialog,
    SignPadDialog,
    SummaryOfBenefitsDialog,
    CancelApplicationDialog,
    DeactivateGuardDialog
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
