using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Gov.Cscp.VictimServices.Public.HealthChecks;

public class ApiSelfHealthCheck : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default
    )
    {
        return Task.FromResult(HealthCheckResult.Healthy("API process is healthy."));
    }
}
