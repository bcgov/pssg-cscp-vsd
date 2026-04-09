export interface Configuration {
  outageStartDate?: string;
  outageEndDate?: string;
  outageMessage?: string;
  featureFlags?: FeatureFlagConfiguration;
  keycloak?: KeycloakConfiguration;
}

export interface FeatureFlagConfiguration {
  useAuthentication: boolean;
  useUpdatedComplianceFields: boolean;
}

export interface KeycloakConfiguration {
  authority?: string;
  redirectUrl?: string;
  postLoginRoute?: string;
  postLogoutRedirectUri?: string;
  autoUserInfo?: boolean;
  clientId?: string;
  kcIdpHint?: string;
  prompt?: string;
  scope?: string;
  responseType?: string;
  silentRenew?: boolean;
  useRefreshToken?: boolean;
  ignoreNonceAfterRefresh?: boolean;
  triggerRefreshWhenIdTokenExpired?: boolean;
  renewTimeBeforeTokenExpiresInSeconds?: number;
  logLevel?: number;
}
