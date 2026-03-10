import type {
  CityLookupDto,
  CountryLookupDto,
  LookupItemDto,
  PoliceDetachmentLookupDto,
  ProvinceLookupDto,
  RelationshipLookupDto
} from '../../model';

/**
 * @deprecated Replaced by LookupStore (@ngrx/signals).
 * All static lookups are now pre-loaded at app initialization via LookupStore.
 * This interface is no longer used and can be removed.
 */
export interface iLookupData {
  countries: CountryLookupDto[];
  provinces: ProvinceLookupDto[];
  cities: CityLookupDto[];
  relationships?: RelationshipLookupDto[];
  imfRepresentativeRelationships?: RelationshipLookupDto[];
  representativeRelationships?: RelationshipLookupDto[];
  courts?: LookupItemDto[];
  police_detachments?: PoliceDetachmentLookupDto[];
}
