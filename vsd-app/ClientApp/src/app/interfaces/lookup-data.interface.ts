import type {
  CityLookupDto,
  CountryLookupDto,
  LookupItemDto,
  PoliceDetachmentLookupDto,
  ProvinceLookupDto,
  RelationshipLookupDto
} from '../../model';

// TODO: should be replaced with signal store
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
