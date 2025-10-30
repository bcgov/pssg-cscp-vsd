using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Gov.Cscp.VictimServices.Public.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConfigurationController : ControllerBase
    {
        private readonly ILogger<ConfigurationController> logger;
        private readonly IConfiguration configuration;

        public ConfigurationController(ILogger<ConfigurationController> logger, IConfiguration configuration)
        {
            this.logger = logger;
            this.configuration = configuration;
        }

        [AllowAnonymous]
        [HttpGet]
        public IActionResult GetConfiguration()
        {
            try
            {
                var config = new AppConfiguration
                {
                    OutageMessage = configuration.GetValue<string>("CONFIGURATION_OUTAGEINFORMATION_MESSAGE"),
                    OutageStartDate = configuration.GetValue<string>("CONFIGURATION_OUTAGEINFORMATION_STARTDATE"),
                    OutageEndDate = configuration.GetValue<string>("CONFIGURATION_OUTAGEINFORMATION_ENDDATE"),
                    FeatureFlags = new FeatureFlagConfiguration
                    {
                        UseUpdatedComplianceFields = configuration.GetValue<bool>(
                            "FEATURE_USE_UPDATED_COMPLIANCE_FIELDS"
                        ),
                    },
                };

                return Ok(config);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to retrieve configuration information.");
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}

public class AppConfiguration
{
    public string OutageMessage { get; set; }
    public string OutageStartDate { get; set; }
    public string OutageEndDate { get; set; }

    public FeatureFlagConfiguration FeatureFlags { get; set; }
};

public class FeatureFlagConfiguration
{
    public bool UseUpdatedComplianceFields { get; set; }
}
