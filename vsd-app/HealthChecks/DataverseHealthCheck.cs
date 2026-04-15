using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Crm.Sdk.Messages;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk.Messages;

namespace Gov.Cscp.VictimServices.Public.HealthChecks;

public class DataverseHealthCheck : IHealthCheck
{
    private readonly IOrganizationServiceAsync _organizationService;

    public DataverseHealthCheck(IOrganizationServiceAsync organizationService)
    {
        _organizationService = organizationService;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            if (_organizationService is ServiceClient serviceClient && !serviceClient.IsReady)
            {
                return HealthCheckResult.Unhealthy("Dataverse ServiceClient is not ready.");
            }

            await _organizationService.ExecuteAsync(new WhoAmIRequest());

            return HealthCheckResult.Healthy("Dataverse connection is healthy.");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Dataverse health check failed.", exception: ex);
        }
    }
}
