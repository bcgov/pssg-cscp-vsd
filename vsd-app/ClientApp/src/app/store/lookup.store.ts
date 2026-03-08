import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { LookupService } from '../../api/lookup/lookup.service';
import type {
  CityLookupDto,
  CountryLookupDto,
  LookupItemDto,
  PoliceDetachmentLookupDto,
  ProvinceLookupDto,
  RelationshipLookupDto
} from '../../model';
import { config } from '../../config';

export interface LookupState {
  countries: CountryLookupDto[];
  provinces: ProvinceLookupDto[];
  /** BC cities pre-loaded at startup */
  bcCities: CityLookupDto[];
  relationships: RelationshipLookupDto[];
  authRelationships: RelationshipLookupDto[];
  representativeRelationships: RelationshipLookupDto[];
  imfRepresentativeRelationships: RelationshipLookupDto[];
  policeDetachments: PoliceDetachmentLookupDto[];
  courts: LookupItemDto[];
  cvapEmail: string;
  cvapCounsellingEmail: string;
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
}

const initialState: LookupState = {
  countries: [],
  provinces: [],
  bcCities: [],
  relationships: [],
  authRelationships: [],
  representativeRelationships: [],
  imfRepresentativeRelationships: [],
  policeDetachments: [],
  courts: [],
  cvapEmail: '',
  cvapCounsellingEmail: '',
  isLoading: false,
  isLoaded: false,
  error: null
};

const sortByName = <T extends { name?: string }>(arr: T[]): T[] =>
  [...arr].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));

/**
 * Lookup analysis — can be pre-loaded at app startup (no user input required):
 *   countries, provinces, BC cities, all relationship variants,
 *   police detachments, courts, CVAP email addresses.
 *
 * Must remain dynamic (require user selection):
 *   - getApiLookupCitiesSearch          (city autocomplete while typing)
 *   - getApiLookupCountryCountryIdCities (cities for countries without provinces)
 *   - getApiLookupCountryCountryIdProvinceProvinceIdCities  (non-BC province cities)
 */
export const LookupStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, lookupService = inject(LookupService)) => ({
    async loadAll(): Promise<void> {
      patchState(store, { isLoading: true, error: null });

      try {
        const [
          countriesRes,
          provincesRes,
          bcCitiesRes,
          relationshipsRes,
          authRelationshipsRes,
          repRelationshipsRes,
          imfRepRelationshipsRes,
          policeDetachmentsRes,
          courtsRes,
          cvapEmailsRes
        ] = await Promise.all([
          firstValueFrom(lookupService.getApiLookupCountries()),
          firstValueFrom(lookupService.getApiLookupProvinces()),
          firstValueFrom(
            lookupService.getApiLookupCountryCountryIdProvinceProvinceIdCities(
              config.canada_crm_id,
              config.bc_crm_id
            )
          ),
          firstValueFrom(lookupService.getApiLookupRelationships()),
          firstValueFrom(lookupService.getApiLookupAuthRelationships()),
          firstValueFrom(lookupService.getApiLookupRepresentativeRelationships()),
          firstValueFrom(lookupService.getApiLookupImfRepresentativeRelationships()),
          firstValueFrom(lookupService.getApiLookupPoliceDetachments()),
          firstValueFrom(lookupService.getApiLookupCourts()),
          firstValueFrom(lookupService.getApiLookupCvapEmails())
        ]);

        patchState(store, {
          countries: sortByName(countriesRes.value ?? []),
          provinces: sortByName(provincesRes.value ?? []),
          bcCities: sortByName(bcCitiesRes.value ?? []),
          relationships: sortByName(relationshipsRes.value ?? []),
          authRelationships: sortByName(authRelationshipsRes.value ?? []),
          representativeRelationships: sortByName(repRelationshipsRes.value ?? []),
          imfRepresentativeRelationships: sortByName(imfRepRelationshipsRes.value ?? []),
          policeDetachments: sortByName(policeDetachmentsRes.value ?? []),
          courts: sortByName(courtsRes.value ?? []),
          cvapEmail: cvapEmailsRes.cvapEmail ?? '',
          cvapCounsellingEmail: cvapEmailsRes.cvapCounsellingEmail ?? '',
          isLoading: false,
          isLoaded: true
        });
      } catch (err) {
        patchState(store, {
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to load lookup data'
        });
        throw err;
      }
    }
  }))
);
