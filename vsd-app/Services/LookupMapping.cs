using System.Collections.Generic;
using System.Linq;
using Gov.Cscp.VictimServices.Public.Models;
using Microsoft.Xrm.Sdk;

namespace Gov.Cscp.VictimServices.Public.Services
{
    public static class LookupMapping
    {
        public static LookupResponseDto<T> ToLookupResponse<T>(IQueryable<T> items)
        {
            return new LookupResponseDto<T> { Value = items.ToList() };
        }

        public static CountryLookupDto ToCountryLookupDto(Entity entity)
        {
            return new CountryLookupDto { Id = entity.Id, Name = entity.GetAttributeValue<string>("vsd_name") };
        }

        public static ProvinceLookupDto ToProvinceLookupDto(Entity entity)
        {
            return new ProvinceLookupDto
            {
                Id = entity.Id,
                Name = entity.GetAttributeValue<string>("vsd_name"),
                Code = entity.GetAttributeValue<string>("vsd_code"),
                CountryId = entity.GetAttributeValue<EntityReference>("vsd_countryid")?.Id,
            };
        }

        public static CityLookupDto ToCityLookupDto(Entity entity)
        {
            return new CityLookupDto
            {
                Id = entity.Id,
                Name = entity.GetAttributeValue<string>("vsd_name"),
                CountryId = entity.GetAttributeValue<EntityReference>("vsd_countryid")?.Id,
                ProvinceId = entity.GetAttributeValue<EntityReference>("vsd_stateid")?.Id,
            };
        }

        public static RelationshipLookupDto ToRelationshipLookupDto(Entity entity)
        {
            return new RelationshipLookupDto { Id = entity.Id, Name = entity.GetAttributeValue<string>("vsd_name") };
        }

        public static PoliceDetachmentLookupDto ToPoliceDetachmentLookupDto(Entity entity)
        {
            return new PoliceDetachmentLookupDto
            {
                Id = entity.Id,
                Name = entity.GetAttributeValue<string>("vsd_name"),
            };
        }

        public static LookupItemDto ToCourtLookupItemDto(Entity entity)
        {
            return new LookupItemDto { Id = entity.Id, Name = entity.GetAttributeValue<string>("vsd_name") };
        }
    }
}
