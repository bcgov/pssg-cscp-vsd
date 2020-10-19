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
            _coastAuthService = coastAuthService; ;
        }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            // request the access token
            var accessToken = await _coastAuthService.GetToken();

            // set the bearer token to the outgoing request
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            // Proceed calling the inner handler, that will actually send the request
            // to our protected api
            return await base.SendAsync(request, cancellationToken);
        }
    }
}
