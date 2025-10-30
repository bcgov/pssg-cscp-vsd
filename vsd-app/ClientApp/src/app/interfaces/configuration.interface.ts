export interface Configuration {
  outageStartDate?: string;
  outageEndDate?: string;
  outageMessage?: string;
  featureFlags?: FeatureFlagConfiguration;
}

export interface FeatureFlagConfiguration {
  useUpdatedComplianceFields: boolean;
}
