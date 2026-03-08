import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { ConfigurationService } from '../../api/configuration/configuration.service';
import type { Configuration, FeatureFlagConfiguration } from '../interfaces/configuration.interface';

export interface ConfigState {
  outageStartDate: string | null;
  outageEndDate: string | null;
  outageMessage: string | null;
  featureFlags: FeatureFlagConfiguration;
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
}

const initialState: ConfigState = {
  outageStartDate: null,
  outageEndDate: null,
  outageMessage: null,
  featureFlags: { useUpdatedComplianceFields: false },
  isLoading: false,
  isLoaded: false,
  error: null
};

export const ConfigStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, configService = inject(ConfigurationService)) => ({
    async load(): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const config = await firstValueFrom(configService.getApiConfiguration<Configuration>());
        patchState(store, {
          outageStartDate: config?.outageStartDate ?? null,
          outageEndDate: config?.outageEndDate ?? null,
          outageMessage: config?.outageMessage ?? null,
          featureFlags: config?.featureFlags ?? { useUpdatedComplianceFields: false },
          isLoading: false,
          isLoaded: true
        });
      } catch (err) {
        patchState(store, {
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to load configuration'
        });
        throw err;
      }
    }
  }))
);
