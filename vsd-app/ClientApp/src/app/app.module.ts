import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';
import { CdkTableModule } from '@angular/cdk/table';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgBusyModule } from 'ng-busy';
import { AlertModule } from 'ngx-bootstrap/alert';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { CookieService } from 'ngx-cookie-service';
import { FileDropModule } from 'ngx-file-drop';
import { NgxMaskModule } from 'ngx-mask';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ApplicationCancelledComponent } from './application-cancelled/application-cancelled.component';
import { ApplicationSuccessComponent } from './application-success/application-success.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { HomeComponent } from './home/home.component';
import { IfmApplicationComponent } from './ifm-application/ifm-application.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { PhonePipe } from './pipes/phone.pipe';
import { QuickExitComponent } from './quick-exit/quick-exit.component';
import { AEMService } from './services/aem.service';
import { JusticeApplicationDataService } from './services/justice-application-data.service';
import { LookupService } from './services/lookup.service';
import { StateService } from './services/state.service';
import { HeaderTitleService } from './services/titile.service';
import { AddressComponent } from './shared/address/address.component';
import { ApplicationReviewComponent } from './shared/application-review/application-review.component';
import { AuthorizationInformationComponent } from './shared/authorization-information/authorization-information.component';
import { CancelApplicationDialog } from './shared/cancel-dialog/cancel-dialog.component';
import { GenderSelectorComponent } from './shared/components/gender-selector/gender-selector.component';
import { PronounSelectorComponent } from './shared/components/pronoun-selector/pronoun-selector.component';
import { RaceSelectorComponent } from './shared/components/race-selector/race-selector.component';
import { CrimeInformationComponent } from './shared/crime-information/crime-information.component';
import { DateFieldComponent } from './shared/date-field/date-field.component';
import { DeclarationInformationComponent } from './shared/declaration-information/declaration-information.component';
import { CancelDialog } from './shared/dialogs/cancel/cancel.dialog';
import { GSTWarningDialog } from './shared/dialogs/gst-warning/gst-warning.dialog';
import { InvoiceInstructionsDialog } from './shared/dialogs/invoice-instructions/invoice-instructions.dialog';
import { MessageDialog } from './shared/dialogs/message-dialog/message.dialog';
import { FeatureEnabledDirective } from './shared/directives/feature-enabled.directive';
import { EmploymentInformationComponent } from './shared/employment-information/employment-information.component';
import { ExpenseInformationComponent } from './shared/expense-information/expense-information.component';
import { FieldComponent } from './shared/field/field.component';
import { FileUploaderComponent } from './shared/file-uploader/file-uploader.component';
import { IntroductionComponent } from './shared/introduction/introduction.component';
import { MedicalInformationComponent } from './shared/medical-information/medical-information.component';
import { PersonalInformationComponent } from './shared/personal-information/personal-information.component';
import { RepresentativeInformationComponent } from './shared/representative-information/representative-information.component';
import { ToolTipTriggerComponent } from './shared/tool-tip/tool-tip.component';
import { VictimInformationComponent } from './shared/victim-information/victim-information.component';
import { SignPadDialog } from './sign-dialog/sign-dialog.component';
import { SubmitInvoiceComponent } from './submit-invoice/submit-invoice.component';
import { SummaryOfBenefitsDialog } from './summary-of-benefits/summary-of-benefits.component';
import { VictimApplicationComponent } from './victim-application/victim-application.component';
import { WitnessApplicationComponent } from './witness-application/witness-application.component';

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
    FeatureEnabledDirective,
    FieldComponent,
    FileUploaderComponent,
    GenderSelectorComponent,
    GSTWarningDialog,
    HomeComponent,
    IfmApplicationComponent,
    IntroductionComponent,
    InvoiceInstructionsDialog,
    MedicalInformationComponent,
    MessageDialog,
    NotFoundComponent,
    PersonalInformationComponent,
    PhonePipe,
    PronounSelectorComponent,
    QuickExitComponent,
    RaceSelectorComponent,
    RepresentativeInformationComponent,
    SubmitInvoiceComponent,
    SummaryOfBenefitsDialog,
    ToolTipTriggerComponent,
    VictimApplicationComponent,
    VictimInformationComponent,
    WitnessApplicationComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    CdkTableModule,
    FileDropModule,
    FormsModule,
    HttpClientModule,
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
    AngularSignaturePadModule,
    SignPadDialog,
    AlertModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgxMaskModule.forRoot(),
    TooltipModule.forRoot(),
    TypeaheadModule.forRoot()
  ],
  exports: [
    AppRoutingModule,
    AngularSignaturePadModule,
    BrowserAnimationsModule,
    BrowserModule,
    CdkTableModule,
    FileDropModule,
    FormsModule,
    HttpClientModule,
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
    SignPadDialog,
    TooltipModule
  ],
  providers: [
    AEMService,
    CookieService,
    CrimeInformationComponent,
    JusticeApplicationDataService,
    LookupService,
    StateService,
    HeaderTitleService,
    Title
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
