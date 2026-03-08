using System;
using System.Collections.Generic;

namespace Gov.Cscp.VictimServices.Public.Models
{
    public record LookupItemDto
    {
        public Guid Id { get; init; }
        public string Name { get; init; }
    }

    public record CountryLookupDto
    {
        public Guid Id { get; init; }
        public string Name { get; init; }
    }

    public record ProvinceLookupDto
    {
        public Guid Id { get; init; }
        public string Name { get; init; }
        public string Code { get; init; }
        public Guid? CountryId { get; init; }
    }

    public record CityLookupDto
    {
        public Guid Id { get; init; }
        public string Name { get; init; }
        public Guid? CountryId { get; init; }
        public Guid? ProvinceId { get; init; }
    }

    public record RelationshipLookupDto
    {
        public Guid Id { get; init; }
        public string Name { get; init; }
    }

    public record PoliceDetachmentLookupDto
    {
        public Guid Id { get; init; }
        public string Name { get; init; }
    }

    public record LookupResponseDto<T>
    {
        public IReadOnlyList<T> Value { get; init; }
    }

    public record CitySearchResponseDto
    {
        public string Result { get; init; }
        public IReadOnlyList<CityLookupDto> CityCollection { get; init; }
        public IReadOnlyList<CountryLookupDto> CountryCollection { get; init; }
        public IReadOnlyList<ProvinceLookupDto> ProvinceCollection { get; init; }
    }

    public record CVAPEmailResult
    {
        public string CVAPEmail { get; init; }
        public string CVAPCounsellingEmail { get; init; }
    }
}
