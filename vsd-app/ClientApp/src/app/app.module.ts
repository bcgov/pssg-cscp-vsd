import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule, Title } from '@angular/platform-browser';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
// import { HttpModule } from '@angular/http';
import { NgModule } from '@angular/core';
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
// import { EmploymentIncomeComponent } from './employment-income/employment-income.component';
import { AEMService } from './services/aem.service';
import { AddressComponent } from './shared/address/address.component';
import { AddressLegacyComponent } from './shared/address-legacy/address-legacy.component';
import { AliasDataService } from './services/alias-data.service';
import { AppComponent } from './app.component';
import { ApplicationCancelledComponent } from './application-cancelled/application-cancelled.component';
import { ApplicationReviewComponent } from './shared/application-review/application-review.component';
import { ApplicationSuccessComponent } from './application-success/application-success.component';
import { AuthorizationInformationComponent } from './shared/authorization-information/authorization-information.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { BsDatepickerModule, AlertModule, BsDropdownModule } from 'ngx-bootstrap';
import { CanDeactivateGuard } from './services/can-deactivate-guard.service';
import { CancelApplicationDialog } from './shared/cancel-dialog/cancel-dialog.component';
import { CancelDialog } from './shared/dialogs/cancel/cancel.dialog';
import { CdkTableModule } from '@angular/cdk/table';
import { CrimeInformationComponent } from './shared/crime-information/crime-information.component';
import { DateFieldComponent } from './shared/date-field/date-field.component';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { DeactivateGuardDialog } from './shared/guard-dialog/guard-dialog.component';
import { DeclarationInformationComponent } from './shared/declaration-information/declaration-information.component';
import { DigitOnlyDirective } from './directive/number-only.directive';
import { EmploymentInformationComponent } from './shared/employment-information/employment-information.component';
import { ExpenseInformationComponent } from './shared/expense-information/expense-information.component';
import { FieldComponent } from './shared/field/field.component';
import { FileDropModule } from 'ngx-file-drop';
import { FileUploaderBoxComponent } from './file-uploader-box/file-uploader-box.component';
import { FileUploaderComponent } from './shared/file-uploader/file-uploader.component';
import { FilenameBlockComponent } from './filename-block/filename-block.component';
import { GSTWarningDialog } from './shared/dialogs/gst-warning/gst-warning.dialog';
import { HomeComponent } from './home/home.component';
import { IfmApplicationComponent } from './ifm-application/ifm-application.component';
import { IntroductionComponent } from './shared/introduction/introduction.component';
import { InvoiceInstructionsDialog } from './shared/dialogs/invoice-instructions/invoice-instructions.dialog';
import { JusticeApplicationDataService } from './services/justice-application-data.service';
import { LookupService } from './services/lookup.service';
import { MedicalInformationComponent } from './shared/medical-information/medical-information.component';
import { NameBlockComponent } from './name-block/name-block.component';
import { NgBusyModule } from 'ng-busy';
import { NgxMaskModule } from 'ngx-mask'
import { NotFoundComponent } from './not-found/not-found.component';
import { OffenderRestitutionComponent } from './offender-restitution/offender-restitution.component';
import { OffenderRestitutionReviewComponent } from './offender-restitution/offender-restitution-review.component';
import { PersonalInformationComponent } from './shared/personal-information/personal-information.component';
import { PhonePipe } from './pipes/phone.pipe';
import { QuickExitComponent } from './quick-exit/quick-exit.component';
import { RepresentativeInformationComponent } from './shared/representative-information/representative-information.component';
import { RestitutionApplicationComponent } from './restitution-application/restitution-application.component';
import { SignPadDialog } from './sign-dialog/sign-dialog.component';
import { SignaturePadModule } from 'angular2-signaturepad';
import { StateService } from './services/state.service';
import { StaticComponent } from './static/static.component';
import { SubmitInvoiceComponent } from './submit-invoice/submit-invoice.component';
import { SummaryOfBenefitsDialog } from './summary-of-benefits/summary-of-benefits.component';
import { TermsAndConditionsComponent } from './lite/terms-and-conditions/terms-and-conditions.component';
import { TestComponent } from './test/test.component';
import { ToolTipTriggerComponent } from './shared/tool-tip/tool-tip.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { VersionInfoDataService } from './services/version-info-data.service';
import { VersionInfoDialog } from './version-info/version-info.component';
import { VictimApplicationComponent } from './victim-application/victim-application.component';
import { VictimInformationComponent } from './shared/victim-information/victim-information.component';
import { VictimRestitutionComponent } from './victim-restitution/victim-restitution.component';
import { VictimRestitutionReviewComponent } from './victim-restitution/victim-restitution-review.component';
import { WitnessApplicationComponent } from './witness-application/witness-application.component';
import { RestitutionOverviewComponent } from './shared/restitution/restitution-overview/restitution-overview.component';
import { RestitutionInformationComponent } from './shared/restitution/restitution-information/restitution-information.component';
import { RestitutionContactInformationComponent } from './shared/restitution/contact-information/contact-information.component';

@NgModule({
  declarations: [
    AddressComponent,
    AddressLegacyComponent,
    AppComponent,
    ApplicationCancelledComponent,
    ApplicationReviewComponent,
    ApplicationSuccessComponent,
    AuthorizationInformationComponent,
    BreadcrumbComponent,
    CancelApplicationDialog,
    CancelDialog,
    CrimeInformationComponent,
    DateFieldComponent,
    DatePickerComponent,
    DeactivateGuardDialog,
    DeclarationInformationComponent,
    DigitOnlyDirective,
    EmploymentInformationComponent,
    ExpenseInformationComponent,
    FieldComponent,
    FileUploaderBoxComponent,
    FileUploaderComponent,
    FilenameBlockComponent,
    GSTWarningDialog,
    HomeComponent,
    IfmApplicationComponent,
    IntroductionComponent,
    InvoiceInstructionsDialog,
    MedicalInformationComponent,
    NameBlockComponent,
    NotFoundComponent,
    OffenderRestitutionComponent,
    OffenderRestitutionReviewComponent,
    PersonalInformationComponent,
    PhonePipe,
    QuickExitComponent,
    RepresentativeInformationComponent,
    RestitutionContactInformationComponent,
    RestitutionInformationComponent,
    RestitutionOverviewComponent,
    RestitutionApplicationComponent,
    SignPadDialog,
    StaticComponent,
    SubmitInvoiceComponent,
    SummaryOfBenefitsDialog,
    TermsAndConditionsComponent,
    TestComponent,
    ToolTipTriggerComponent,
    VersionInfoDialog,
    VictimApplicationComponent,
    VictimInformationComponent,
    VictimRestitutionComponent,
    VictimRestitutionReviewComponent,
    WitnessApplicationComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    CdkTableModule,
    FileDropModule,
    FormsModule,
    HttpClientModule,
    // HttpModule,
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
    MatSlideToggleModule,
    MatSliderModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    NgBusyModule,
    ReactiveFormsModule,
    SignaturePadModule,
    AlertModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgxMaskModule.forRoot(),
    TooltipModule.forRoot(),
    TypeaheadModule.forRoot(),
  ],
  exports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    CdkTableModule,
    FileDropModule,
    FormsModule,
    HttpClientModule,
    // HttpModule,
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
    MatSlideToggleModule,
    MatSliderModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    ReactiveFormsModule,
    TooltipModule,
  ],
  providers: [
    AEMService,
    AliasDataService,
    CanDeactivateGuard,
    CookieService,
    CrimeInformationComponent,
    JusticeApplicationDataService,
    LookupService,
    StateService,
    Title,
    VersionInfoDataService,
  ],
  entryComponents: [
    CancelApplicationDialog,
    CancelDialog,
    DeactivateGuardDialog,
    InvoiceInstructionsDialog,
    GSTWarningDialog,
    SignPadDialog,
    SummaryOfBenefitsDialog,
    VersionInfoDialog,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
