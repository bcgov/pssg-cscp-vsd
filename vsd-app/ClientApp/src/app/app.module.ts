import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule, Title } from '@angular/platform-browser';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
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
import { AEMService } from './services/aem.service';
import { AddressComponent } from './shared/address/address.component';
import { AppComponent } from './app.component';
import { ApplicationCancelledComponent } from './application-cancelled/application-cancelled.component';
import { ApplicationReviewComponent } from './shared/application-review/application-review.component';
import { ApplicationSuccessComponent } from './application-success/application-success.component';
import { AuthorizationInformationComponent } from './shared/authorization-information/authorization-information.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { BsDatepickerModule, AlertModule, BsDropdownModule } from 'ngx-bootstrap';
import { CancelApplicationDialog } from './shared/cancel-dialog/cancel-dialog.component';
import { CancelDialog } from './shared/dialogs/cancel/cancel.dialog';
import { CdkTableModule } from '@angular/cdk/table';
import { CrimeInformationComponent } from './shared/crime-information/crime-information.component';
import { DateFieldComponent } from './shared/date-field/date-field.component';
import { DeclarationInformationComponent } from './shared/declaration-information/declaration-information.component';
import { EmploymentInformationComponent } from './shared/employment-information/employment-information.component';
import { ExpenseInformationComponent } from './shared/expense-information/expense-information.component';
import { FieldComponent } from './shared/field/field.component';
import { FileDropModule } from 'ngx-file-drop';
import { FileUploaderComponent } from './shared/file-uploader/file-uploader.component';
import { GSTWarningDialog } from './shared/dialogs/gst-warning/gst-warning.dialog';
import { HomeComponent } from './home/home.component';
import { IfmApplicationComponent } from './ifm-application/ifm-application.component';
import { IntroductionComponent } from './shared/introduction/introduction.component';
import { InvoiceInstructionsDialog } from './shared/dialogs/invoice-instructions/invoice-instructions.dialog';
import { JusticeApplicationDataService } from './services/justice-application-data.service';
import { LookupService } from './services/lookup.service';
import { MedicalInformationComponent } from './shared/medical-information/medical-information.component';
import { NgBusyModule } from 'ng-busy';
import { NgxMaskModule } from 'ngx-mask'
import { NotFoundComponent } from './not-found/not-found.component';
import { PersonalInformationComponent } from './shared/personal-information/personal-information.component';
import { PhonePipe } from './pipes/phone.pipe';
import { QuickExitComponent } from './quick-exit/quick-exit.component';
import { RepresentativeInformationComponent } from './shared/representative-information/representative-information.component';
import { RestitutionApplicationComponent } from './restitution-application/restitution-application.component';
import { SignPadDialog } from './sign-dialog/sign-dialog.component';
import { SignaturePadModule } from 'angular2-signaturepad';
import { StateService } from './services/state.service';
import { SubmitInvoiceComponent } from './submit-invoice/submit-invoice.component';
import { SummaryOfBenefitsDialog } from './summary-of-benefits/summary-of-benefits.component';
import { ToolTipTriggerComponent } from './shared/tool-tip/tool-tip.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { VictimApplicationComponent } from './victim-application/victim-application.component';
import { VictimInformationComponent } from './shared/victim-information/victim-information.component';
import { WitnessApplicationComponent } from './witness-application/witness-application.component';
import { RestitutionOverviewComponent } from './shared/restitution/restitution-overview/restitution-overview.component';
import { RestitutionInformationComponent } from './shared/restitution/restitution-information/restitution-information.component';
import { RestitutionContactInformationComponent } from './shared/restitution/contact-information/contact-information.component';
import { RestitutionReviewComponent } from './shared/restitution/review/review.component';
import { HeaderTitleService } from './services/titile.service';

@NgModule({
  declarations: [
    AddressComponent,
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
    DeclarationInformationComponent,
    EmploymentInformationComponent,
    ExpenseInformationComponent,
    FieldComponent,
    FileUploaderComponent,
    GSTWarningDialog,
    HomeComponent,
    IfmApplicationComponent,
    IntroductionComponent,
    InvoiceInstructionsDialog,
    MedicalInformationComponent,
    NotFoundComponent,
    PersonalInformationComponent,
    PhonePipe,
    QuickExitComponent,
    RepresentativeInformationComponent,
    RestitutionApplicationComponent,
    RestitutionContactInformationComponent,
    RestitutionInformationComponent,
    RestitutionOverviewComponent,
    RestitutionReviewComponent,
    SignPadDialog,
    SubmitInvoiceComponent,
    SummaryOfBenefitsDialog,
    ToolTipTriggerComponent,
    VictimApplicationComponent,
    VictimInformationComponent,
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
    CookieService,
    CrimeInformationComponent,
    JusticeApplicationDataService,
    LookupService,
    StateService,
    HeaderTitleService,
    Title,
  ],
  entryComponents: [
    CancelApplicationDialog,
    CancelDialog,
    InvoiceInstructionsDialog,
    GSTWarningDialog,
    SignPadDialog,
    SummaryOfBenefitsDialog,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
