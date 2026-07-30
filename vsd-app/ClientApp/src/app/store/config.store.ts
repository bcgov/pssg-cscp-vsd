import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import moment from 'moment-timezone';
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
      const current = moment().tz('America/Vancouver');
      const start = moment(startDate).tz('America/Vancouver');
      const end = moment(endDate).tz('America/Vancouver');
      return current.isBetween(start, end, null, '[]');
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
