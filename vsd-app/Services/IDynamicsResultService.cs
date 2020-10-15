using Microsoft.AspNetCore.Http;
using Gov.Cscp.VictimServices.Public.Models;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace Gov.Cscp.VictimServices.Public.Services
{
    public interface IDynamicsResultService
    {
        Task<DynamicsResult> GetResultAsync(string endpointUrl);
        Task<DynamicsResult> GetResultAsync(string endpointUrl, string requestJson);
        Task<DynamicsResult> SetDataAsync(string endpointUrl, string requestJson);

    }
}
