using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using IdentityModel.Client;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Serilog;

namespace Gov.Cscp.VictimServices.Public.Services
{
    public class AEMTokenHandler : DelegatingHandler
    {
        private const string CacheKey = "aem_access_token";

        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IMemoryCache _cache;
        private readonly IConfiguration _configuration;
        private readonly ILogger _logger;

        public AEMTokenHandler(IHttpClientFactory httpClientFactory, IMemoryCache cache, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _cache = cache;
            _configuration = configuration;
            _logger = Log.Logger;
        }

        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken
        )
        {
            var token = await GetTokenAsync();
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            return await base.SendAsync(request, cancellationToken);
        }

        private async Task<string> GetTokenAsync()
        {
            if (_cache.TryGetValue(CacheKey, out string cachedToken))
                return cachedToken;

            var tokenUrl = _configuration["auth:aem:tokenUrl"];
            var clientId = _configuration["auth:aem:clientId"];
            var clientSecret = _configuration["auth:aem:clientSecret"];

            using var httpClient = _httpClientFactory.CreateClient("aem_token");
            var response = await httpClient.RequestClientCredentialsTokenAsync(
                new ClientCredentialsTokenRequest
                {
                    Address = tokenUrl,
                    ClientId = clientId,
                    ClientSecret = clientSecret,
                }
            );

            if (response.IsError)
            {
                _logger.Error(
                    "AEM token acquisition failed: {Error} - {Description}",
                    response.Error,
                    response.ErrorDescription
                );
                throw new InvalidOperationException(
                    $"AEM token acquisition failed: {response.Error} - {response.ErrorDescription}"
                );
            }

            var expiresIn = response.ExpiresIn > 60 ? response.ExpiresIn - 60 : response.ExpiresIn;
            _cache.Set(CacheKey, response.AccessToken, TimeSpan.FromSeconds(expiresIn));

            return response.AccessToken;
        }
    }
}
