import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';
import { CdkTableModule } from '@angular/cdk/table';
import { HttpClient, provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
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
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { NgxFileDropModule } from 'ngx-file-drop';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ApplicationCancelledComponent } from './application-cancelled/application-cancelled.component';
import { ApplicationSelectorComponent } from './application-selector/application-selector.component';
import { ApplicationSuccessComponent } from './application-success/application-success.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { DraftDashboardComponent } from './draft-dashboard/draft-dashboard.component';
import { IfmApplicationComponent } from './ifm-application/ifm-application.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { LoadingInterceptor } from './interceptors/loading.interceptor';
import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './login/login.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { PhonePipe } from './pipes/phone.pipe';
import { QuickExitComponent } from './quick-exit/quick-exit.component';
import { AEMService } from './services/aem.service';
import { StateService } from './services/state.service';
import { HeaderTitleService } from './services/titile.service';
import { AddressComponent } from './shared/address/address.component';
import { ApplicationReviewComponent } from './shared/application-review/application-review.component';
import { AuthorizationInformationComponent } from './shared/authorization-information/authorization-information.component';
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
import { FormFieldComponent } from './shared/form-field/form-field.component';
import { IntroductionComponent } from './shared/introduction/introduction.component';
import { MedicalInformationComponent } from './shared/medical-information/medical-information.component';
import { PersonalInformationComponent } from './shared/personal-information/personal-information.component';
import { RepresentativeInformationComponent } from './shared/representative-information/representative-information.component';
import { ToolTipTriggerComponent } from './shared/tool-tip/tool-tip.component';
import { VictimInformationComponent } from './shared/victim-information/victim-information.component';
import { SubmitInvoiceComponent } from './submit-invoice/submit-invoice.component';
import { SummaryOfBenefitsDialog } from './summary-of-benefits/summary-of-benefits.component';
import { VictimApplicationComponent } from './victim-application/victim-application.component';
import { WitnessApplicationComponent } from './witness-application/witness-application.component';
import { AuthModule, LogLevel, StsConfigHttpLoader, StsConfigLoader } from 'angular-auth-oidc-client';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

export const httpLoaderFactory = (httpClient: HttpClient) => {
  const config$ = httpClient.get<any>(`/cvapwebform/api/Configuration/keycloak`).pipe(
    catchError(() => of(null)),
    map((customConfig: any) => {
      console.log('OIDC configuration loaded:', customConfig.authority, customConfig.clientId);
      return {
        authority: customConfig.authority,
        redirectUrl: window.location.origin,
        postLoginRoute: '/drafts',
        postLogoutRedirectUri: window.location.origin,
        clientId: customConfig.clientId,
        scope: "openid profile",
        autoUserInfo: false,
        customParamsAuthRequest: {
          kc_idp_hint: 'bcsc'
        },
        responseType: 'code',
        silentRenew:  true,
        useRefreshToken:  true,
        renewTimeBeforeTokenExpiresInSeconds: 30,
        ignoreNonceAfterRefresh: true,
        triggerRefreshWhenIdTokenExpired: false,
        secureRoutes: ['api'],
        historyCleanupOff: true,
        storage: localStorage,
        logLevel: LogLevel.None
      };
    })
  );

  return new StsConfigHttpLoader(config$);
};

@NgModule({
  declarations: [
    AddressComponent,
    AppComponent,
    ApplicationCancelledComponent,
    ApplicationReviewComponent,
    ApplicationSuccessComponent,
    AuthorizationInformationComponent,
    BreadcrumbComponent,
    CancelDialog,
    CrimeInformationComponent,
    DateFieldComponent,
    DeclarationInformationComponent,
    DraftDashboardComponent,
    EmploymentInformationComponent,
    ExpenseInformationComponent,
    FeatureEnabledDirective,
    FieldComponent,
    FormFieldComponent,
    FileUploaderComponent,
    GenderSelectorComponent,
    GSTWarningDialog,
    ApplicationSelectorComponent,
    IfmApplicationComponent,
    LandingComponent,
    LoginComponent,
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
    WitnessApplicationComponent,
    ToolTipTriggerComponent
  ],
  exports: [
    FieldComponent,
    AddressComponent,
    AppRoutingModule,
    AngularSignaturePadModule,
    BrowserAnimationsModule,
    BrowserModule,
    CdkTableModule,
    NgxFileDropModule,
    FormsModule,
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
    TooltipModule
  ],
  bootstrap: [AppComponent],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    CdkTableModule,
    NgxFileDropModule,
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    NgxSpinnerModule,
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
    NgxMaskDirective,
    AngularSignaturePadModule,
    BsDatepickerModule.forRoot(),
    TooltipModule,
    TypeaheadModule.forRoot(),
    AuthModule.forRoot({
      loader: {
        provide: StsConfigLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    AEMService,
    StateService,
    HeaderTitleService,
    Title,
    provideNgxMask(),
    provideHttpClient(withInterceptors([AuthInterceptor, LoadingInterceptor]), withInterceptorsFromDi())
  ]
})
export class AppModule {}
