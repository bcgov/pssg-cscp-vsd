using System.Net.Http;
using System.Threading.Tasks;
using System.Threading;
using System.Net.Http.Headers;

namespace Gov.Cscp.VictimServices.Public.Services
{
    public class TokenHandler : DelegatingHandler
    {
        private readonly ICOASTAuthService _coastAuthService;

        public TokenHandler(
            ICOASTAuthService coastAuthService)
        {
            _coastAuthService = coastAuthService;
        }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var accessToken = await _coastAuthService.GetToken();
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            return await base.SendAsync(request, cancellationToken);
        }
    }
}