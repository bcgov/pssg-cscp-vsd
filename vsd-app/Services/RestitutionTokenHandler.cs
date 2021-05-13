using System.Net.Http;
using System.Threading.Tasks;
using System.Threading;
using System.Net.Http.Headers;

namespace Gov.Cscp.VictimServices.Public.Services
{
    public class RestitutionTokenHandler : DelegatingHandler
    {
        private readonly ICOASTAuthService _coastAuthService;

        public RestitutionTokenHandler(
            ICOASTAuthService coastAuthService)
        {
            _coastAuthService = coastAuthService;
        }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var accessToken = await _coastAuthService.GetRestitutionToken();
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            return await base.SendAsync(request, cancellationToken);
        }
    }
}