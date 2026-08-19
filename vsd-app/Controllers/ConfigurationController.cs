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
                    MaintenanceMode =
                        bool.TryParse(configuration["CONFIGURATION_MAINTENANCE_MODE"], out var maintenanceMode)
                        && maintenanceMode,
                    FeatureFlags = new FeatureFlagConfiguration
                    {
                        UseUpdatedComplianceFields =
                            bool.TryParse(
                                configuration["FEATURE_USE_UPDATED_COMPLIANCE_FIELDS"],
                                out var useUpdatedCompliance
                            ) && useUpdatedCompliance,
                        UseAuthentication =
                            bool.TryParse(configuration["FEATURE_USE_AUTHENTICATION"], out var useAuth) && useAuth,
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

        [AllowAnonymous]
        [HttpGet("keycloak")]
        public IActionResult GetKeycloakConfiguration()
        {
            var keycloak = new KeycloakConfiguration
            {
                Authority = configuration.GetValue<string>("auth:jwt:authority"),
                ClientId = configuration.GetValue<string>("auth:jwt:audience"),
                Scope = configuration.GetValue<string>("auth:jwt:scope"),
            };
            return Ok(keycloak);
        }
    }
}

public class AppConfiguration
{
    public string OutageMessage { get; set; }
    public string OutageStartDate { get; set; }
    public string OutageEndDate { get; set; }
    public bool MaintenanceMode { get; set; }
    public FeatureFlagConfiguration FeatureFlags { get; set; }
};

public class FeatureFlagConfiguration
{
    public bool UseUpdatedComplianceFields { get; set; }
    public bool UseAuthentication { get; set; }
}

public class KeycloakConfiguration
{
    public string Authority { get; set; }
    public string ClientId { get; set; }
    public string Scope { get; set; }
}
