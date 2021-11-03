using Gov.Cscp.VictimServices.Public.Models;
using Gov.Cscp.VictimServices.Public.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Serilog;
using System.Threading.Tasks;
using System;
using System.Net;
using System.Text.Json;

namespace Gov.Cscp.VictimServices.Public.Controllers
{
    [Route("api/[controller]")]
    public class LookupController : Controller
    {
        private readonly IConfiguration configuration;
        private readonly IDynamicsResultService _dynamicsResultService;
        private readonly ILogger _logger;

        public LookupController(IConfiguration configuration, IDynamicsResultService dynamicsResultService)
        {
            this.configuration = configuration;
            this._dynamicsResultService = dynamicsResultService;
            _logger = Log.Logger;
        }

        [HttpGet("cvap-emails")]
        public async Task<IActionResult> GetContactEmail()
        {
            try
            {
                CVAPEmailResult res = new CVAPEmailResult
                {
                    CVAPEmail = configuration["CVAP_EMAIL"],
                    CVAPCounsellingEmail = configuration["CVAP_COUNSELLING_EMAIL"],
                };
                return await Task.FromResult(StatusCode((int)HttpStatusCode.OK, res));
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while looking up contact email. Source = VSU");
                return BadRequest();
            }
            finally { }
        }

        [HttpGet("countries")]
        public async Task<IActionResult> GetCountries()
        {
            try
            {
                // set the endpoint action
                string endpointUrl = "vsd_countries?$select=vsd_name&$filter=statecode eq 0";

                // get the response
                DynamicsResult result = await _dynamicsResultService.Get(endpointUrl);

                return StatusCode((int)result.statusCode, result.result.ToString());
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while looking up countries in COAST. Source = VSD");
                return BadRequest();
            }
            finally { }
        }

        [HttpGet("provinces")]
        public async Task<IActionResult> GetProvinces()
        {
            try
            {
                // set the endpoint action
                string endpointUrl = "vsd_provinces?$select=vsd_code,_vsd_countryid_value,vsd_name&$filter=statecode eq 0";

                // get the response
                DynamicsResult result = await _dynamicsResultService.Get(endpointUrl);

                return StatusCode((int)result.statusCode, result.result.ToString());
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while looking up provinces in COAST. Source = VSD");
                return BadRequest();
            }
            finally { }
        }

        [HttpGet("cities")]
        public async Task<IActionResult> GetCities()
        {
            try
            {
                // set the endpoint action
                string endpointUrl = "vsd_cities?$select=_vsd_countryid_value,vsd_name,_vsd_stateid_value&$filter=statecode eq 0";

                // get the response
                DynamicsResult result = await _dynamicsResultService.Get(endpointUrl);
                return StatusCode((int)result.statusCode, result.result.ToString());
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while looking up cities in COAST. Source = VSD");
                return BadRequest();
            }
            finally { }
        }

        [HttpGet("cities/search")]
        public async Task<IActionResult> SearchCities(string country, string province, string searchVal, int limit)
        {
            try
            {
                var searchParameters = new CitySearchParameters()
                {
                    Country = country,
                    Province = province,
                    City = searchVal,
                    TopCount = limit
                };
                
                string endpointUrl = "vsd_GetCities";

                JsonSerializerOptions options = new JsonSerializerOptions();
                options.IgnoreNullValues = true;
                string requestJson = System.Text.Json.JsonSerializer.Serialize(searchParameters, options);

                DynamicsResult result = await _dynamicsResultService.Post(endpointUrl, requestJson);
                return StatusCode((int)result.statusCode, result.result.ToString());
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while searching cities in COAST. Source = VSD");
                return BadRequest();
            }
            finally { }
        }

        [HttpGet("country/{country}/cities")]
        public async Task<IActionResult> GetCitiesByCountry(string country)
        {
            try
            {
                string requestJson = "{\"Country\":\"" + country + "\"}";
                // set the endpoint action
                string endpointUrl = $"vsd_cities?$select=_vsd_countryid_value,vsd_name,_vsd_stateid_value&$filter=statecode eq 0 and _vsd_countryid_value eq {country}";

                // get the response
                DynamicsResult result = await _dynamicsResultService.Get(endpointUrl);
                return StatusCode((int)result.statusCode, result.result.ToString());
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while looking up citites by country in COAST. Source = VSD");
                return BadRequest();
            }
            finally { }
        }

        [HttpGet("country/{countryId}/province/{provinceId}/cities")]
        public async Task<IActionResult> GetCitiesByProvince(string countryId, string provinceId)
        {
            try
            {
                // set the endpoint action
                string endpointUrl = $"vsd_cities?$select=_vsd_countryid_value,vsd_name,_vsd_stateid_value&$filter=statecode eq 0 and _vsd_countryid_value eq {countryId} and _vsd_stateid_value eq {provinceId}";

                // get the response
                DynamicsResult result = await _dynamicsResultService.Get(endpointUrl);
                return StatusCode((int)result.statusCode, result.result.ToString());
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while looking up cities by province in COAST. Source = VSD");
                return BadRequest();
            }
            finally { }
        }

        [HttpGet("relationships")]
        public async Task<IActionResult> GetRelationships()
        {
            try
            {
                // set the endpoint action
                string endpointUrl = "vsd_relationships?$select=vsd_name&$filter=statecode eq 0";

                // get the response
                DynamicsResult result = await _dynamicsResultService.Get(endpointUrl);
                return StatusCode((int)result.statusCode, result.result.ToString());
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while looking up relationships in COAST. Source = VSD");
                return BadRequest();
            }
            finally { }
        }

        [HttpGet("auth_relationships")]
        public async Task<IActionResult> GetOptionalAuthorizationRelationships()
        {
            try
            {
                // set the endpoint action
                string endpointUrl = "vsd_relationships?$select=vsd_name&$filter=statecode eq 0 and vsd_optionalauthorizedrelationship eq true";

                // get the response
                DynamicsResult result = await _dynamicsResultService.Get(endpointUrl);
                return StatusCode((int)result.statusCode, result.result.ToString());
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while looking up optional auth relationships in COAST. Source = VSD");
                return BadRequest();
            }
            finally { }
        }

        [HttpGet("representative_relationships")]
        public async Task<IActionResult> GetRepresentativeRelationships()
        {
            try
            {
                // set the endpoint action
                string endpointUrl = "vsd_relationships?$select=vsd_name&$filter=statecode eq 0 and vsd_cvap_representativerelationship eq true";

                // get the response
                DynamicsResult result = await _dynamicsResultService.Get(endpointUrl);
                return StatusCode((int)result.statusCode, result.result.ToString());
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while looking up representative relationships in COAST. Source = VSD");
                return BadRequest();
            }
            finally { }
        }

        [HttpGet("restitution_relationships")]
        public async Task<IActionResult> GetRestitutionRelationships()
        {
            try
            {
                // set the endpoint action
                string endpointUrl = "vsd_relationships?$select=vsd_name&$filter=statecode eq 0 and vsd_rest_offenderrelationship eq true";

                // get the response
                DynamicsResult result = await _dynamicsResultService.Get(endpointUrl);
                return StatusCode((int)result.statusCode, result.result.ToString());
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while looking up representative relationships in COAST. Source = VSD");
                return BadRequest();
            }
            finally { }
        }

        [HttpGet("police_detachments")]
        public async Task<IActionResult> GetPoliceDetachments()
        {
            try
            {
                // set the endpoint action
                string endpointUrl = "vsd_policedetachments?$select=vsd_name&$filter=statecode eq 0";

                // get the response
                DynamicsResult result = await _dynamicsResultService.Get(endpointUrl);
                return StatusCode((int)result.statusCode, result.result.ToString());
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while looking up police detachments in COAST. Source = VSD");
                return BadRequest();
            }
            finally { }
        }

        [HttpGet("courts")]
        public async Task<IActionResult> GetCourts()
        {
            try
            {
                // set the endpoint action
                string endpointUrl = "vsd_courts?$select=vsd_name&$filter=statecode eq 0";

                // get the response
                DynamicsResult result = await _dynamicsResultService.Get(endpointUrl);
                return StatusCode((int)result.statusCode, result.result.ToString());
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while looking up courts in COAST. Source = VSD");
                return BadRequest();
            }
            finally { }
        }
    }

    public class CVAPEmailResult
    {
        public string CVAPEmail { get; set; }
        public string CVAPCounsellingEmail { get; set; }
    }

    public class CitySearchParameters
    {
        public string Country { get; set; }
        public string Province { get; set; }
        public string City { get; set; }
        public int TopCount { get; set; }
    }
}
