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
        Task<DynamicsResult> Get(string endpointUrl);
        Task<DynamicsResult> Post(string endpointUrl, string requestJson);
    }
}
