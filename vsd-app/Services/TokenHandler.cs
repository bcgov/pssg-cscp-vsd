using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using Database;

namespace Gov.Cscp.VictimServices.Public.Services
{
    public class TokenHandler : DelegatingHandler
    {
        private readonly ITokenProvider _tokenProvider;

        public TokenHandler(ITokenProvider tokenProvider)
        {
            _tokenProvider = tokenProvider;
        }

        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken
        )
        {
            var accessToken = await _tokenProvider.AcquireToken();
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            return await base.SendAsync(request, cancellationToken);
        }
    }
}
