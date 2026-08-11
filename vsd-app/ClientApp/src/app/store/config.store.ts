import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { ConfigurationService } from '../../api/configuration/configuration.service';
import type { Configuration, FeatureFlagConfiguration } from '../interfaces/configuration.interface';

export interface ConfigState {
  outageStartDate: string | null;
  outageEndDate: string | null;
  outageMessage: string | null;
  featureFlags: FeatureFlagConfiguration;
  error: string | null;
}

const initialState: ConfigState = {
  outageStartDate: null,
  outageEndDate: null,
  outageMessage: null,
  featureFlags: { useAuthentication: false, useUpdatedComplianceFields: false },
  error: null
};

export const ConfigStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    showAnnouncementBanner: computed(() => {
      const message = store.outageMessage();
      const startDate = store.outageStartDate();
      const endDate = store.outageEndDate();
      if (!message || !startDate || !endDate) return false;
      // Dates are ISO 8601 UTC strings (e.g. "2025-09-25T04:00:00Z"). Compare as UTC epoch
      // values so the banner appears at the same instant for all users regardless of locale.
      const now = Date.now();
      return now >= new Date(startDate).getTime() && now <= new Date(endDate).getTime();
    })
  })),
  withMethods((store, configService = inject(ConfigurationService)) => ({
    async load(): Promise<void> {
      patchState(store, { error: null });
      try {
        const config = await firstValueFrom(configService.getApiConfiguration<Configuration>());
        patchState(store, {
          outageStartDate: config?.outageStartDate ?? null,
          outageEndDate: config?.outageEndDate ?? null,
          outageMessage: config?.outageMessage ?? null,
          featureFlags: config?.featureFlags ?? {
            useAuthentication: false,
            useUpdatedComplianceFields: false
          }
        });
      } catch (err) {
        patchState(store, {
          error: err instanceof Error ? err.message : 'Failed to load configuration'
        });
        throw err;
      }
    }
  }))
);
