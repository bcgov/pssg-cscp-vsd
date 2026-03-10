using System;
using System.Threading.Tasks;
using Gov.Cscp.VictimServices.Public.Models;
using Gov.Cscp.VictimServices.Public.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Gov.Cscp.VictimServices.Public.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LookupController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILookupService _lookupService;
        private readonly ILogger<LookupController> _logger;

        public LookupController(
            IConfiguration configuration,
            ILookupService lookupService,
            ILogger<LookupController> logger
        )
        {
            _configuration = configuration;
            _lookupService = lookupService;
            _logger = logger;
        }

        [HttpGet("cvap-emails")]
        public ActionResult<CVAPEmailResult> GetContactEmail()
        {
            try
            {
                var result = new CVAPEmailResult
                {
                    CVAPEmail = _configuration["CVAP_EMAIL"],
                    CVAPCounsellingEmail = _configuration["CVAP_COUNSELLING_EMAIL"],
                };
                return Ok(result);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Unexpected error while looking up contact email. Source = VSD");
                return StatusCode(500);
            }
        }

        [HttpGet("countries")]
        public async Task<ActionResult<LookupResponseDto<CountryLookupDto>>> GetCountries()
        {
            try
            {
                var result = await _lookupService.GetCountriesAsync();
                return Ok(result);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Unexpected error while looking up countries. Source = VSD");
                return StatusCode(500);
            }
        }

        [HttpGet("provinces")]
        public async Task<ActionResult<LookupResponseDto<ProvinceLookupDto>>> GetProvinces()
        {
            try
            {
                var result = await _lookupService.GetProvincesAsync();
                return Ok(result);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Unexpected error while looking up provinces. Source = VSD");
                return StatusCode(500);
            }
        }

        [HttpGet("cities")]
        public async Task<ActionResult<LookupResponseDto<CityLookupDto>>> GetCities()
        {
            try
            {
                var result = await _lookupService.GetCitiesAsync();
                return Ok(result);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Unexpected error while looking up cities. Source = VSD");
                return StatusCode(500);
            }
        }

        [HttpGet("cities/search")]
        public async Task<ActionResult<CitySearchResponseDto>> SearchCities(
            string country,
            string province,
            string searchVal,
            int limit
        )
        {
            try
            {
                var result = await _lookupService.SearchCitiesAsync(country, province, searchVal, limit);
                return Ok(result);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Unexpected error while searching cities. Source = VSD");
                return StatusCode(500);
            }
        }

        [HttpGet("country/{countryId}/cities")]
        public async Task<ActionResult<LookupResponseDto<CityLookupDto>>> GetCitiesByCountry(Guid countryId)
        {
            try
            {
                var result = await _lookupService.GetCitiesByCountryAsync(countryId);
                return Ok(result);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Unexpected error while looking up cities by country. Source = VSD");
                return StatusCode(500);
            }
        }

        [HttpGet("country/{countryId}/province/{provinceId}/cities")]
        public async Task<ActionResult<LookupResponseDto<CityLookupDto>>> GetCitiesByProvince(
            Guid countryId,
            Guid provinceId
        )
        {
            try
            {
                var result = await _lookupService.GetCitiesByProvinceAsync(countryId, provinceId);
                return Ok(result);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Unexpected error while looking up cities by province. Source = VSD");
                return StatusCode(500);
            }
        }

        [HttpGet("relationships")]
        public async Task<ActionResult<LookupResponseDto<RelationshipLookupDto>>> GetRelationships()
        {
            try
            {
                var result = await _lookupService.GetRelationshipsAsync();
                return Ok(result);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Unexpected error while looking up relationships. Source = VSD");
                return StatusCode(500);
            }
        }

        [HttpGet("auth_relationships")]
        public async Task<
            ActionResult<LookupResponseDto<RelationshipLookupDto>>
        > GetOptionalAuthorizationRelationships()
        {
            try
            {
                var result = await _lookupService.GetOptionalAuthorizationRelationshipsAsync();
                return Ok(result);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Unexpected error while looking up optional auth relationships. Source = VSD");
                return StatusCode(500);
            }
        }

        [HttpGet("representative_relationships")]
        public async Task<ActionResult<LookupResponseDto<RelationshipLookupDto>>> GetRepresentativeRelationships()
        {
            try
            {
                var result = await _lookupService.GetRepresentativeRelationshipsAsync();
                return Ok(result);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Unexpected error while looking up representative relationships. Source = VSD");
                return StatusCode(500);
            }
        }

        [HttpGet("imf_representative_relationships")]
        public async Task<ActionResult<LookupResponseDto<RelationshipLookupDto>>> GetIMFRepresentativeRelationships()
        {
            try
            {
                var result = await _lookupService.GetIMFRepresentativeRelationshipsAsync();
                return Ok(result);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Unexpected error while looking up IMF representative relationships. Source = VSD");
                return StatusCode(500);
            }
        }

        [HttpGet("police_detachments")]
        public async Task<ActionResult<LookupResponseDto<PoliceDetachmentLookupDto>>> GetPoliceDetachments()
        {
            try
            {
                var result = await _lookupService.GetPoliceDetachmentsAsync();
                return Ok(result);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Unexpected error while looking up police detachments. Source = VSD");
                return StatusCode(500);
            }
        }

        [HttpGet("courts")]
        public async Task<ActionResult<LookupResponseDto<LookupItemDto>>> GetCourts()
        {
            try
            {
                var result = await _lookupService.GetCourtsAsync();
                return Ok(result);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Unexpected error while looking up courts. Source = VSD");
                return StatusCode(500);
            }
        }
    }
}
