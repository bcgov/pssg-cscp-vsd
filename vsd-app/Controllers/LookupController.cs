using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using Gov.Cscp.VictimServices.Public.Services;
using Gov.Cscp.VictimServices.Public.Models;

namespace Gov.Cscp.VictimServices.Public.Controllers
{
    [Route("api/[controller]")]
    public class LookupController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IDynamicsResultService _dynamicsResultService;

        public LookupController(IConfiguration configuration, IHttpContextAccessor httpContextAccessor, IDynamicsResultService dynamicsResultService)
        {
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
            this._dynamicsResultService = dynamicsResultService;
        }

        [HttpGet("cities")]
        public async Task<IActionResult> GetCities()
        {
            try
            {
                // set the endpoint action
                string endpointUrl = "vsd_cities?$select=_vsd_countryid_value,vsd_name,_vsd_stateid_value&$filter=statecode eq 0";

                // get the response
                DynamicsResult result = await _dynamicsResultService.GetResultAsync(endpointUrl, "");

                return StatusCode(200, result.result.ToString());
            }
            finally { }
        }
    }
}
