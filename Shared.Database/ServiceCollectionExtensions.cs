using Microsoft.Extensions.Options;

namespace Database;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDatabaseService(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure Dynamics token provider options
        services.Configure<DynamicsTokenProviderOptions>(configuration.GetSection("Dynamics"));

        // Add memory cache for token caching
        services.AddMemoryCache();
        services.AddTransient<ICache, MemoryCache>();

        // Add HTTP client factory for token providers
        services.AddHttpClient(
            "oauth_token",
            (sp, c) =>
            {
                var options = sp.GetRequiredService<IOptions<DynamicsTokenProviderOptions>>().Value;
                if (!string.IsNullOrWhiteSpace(options.ADFS.OAuth2TokenEndpoint))
                {
                    c.BaseAddress = new Uri(options.ADFS.OAuth2TokenEndpoint);
                }
            }
        );
        services.AddHttpClient("entraid_token");

        // Register both token providers
        services.AddTransient<ADFSTokenProvider>();
        services.AddTransient<EntraIdTokenProvider>();

        // Register the appropriate token provider based on configuration
        services.AddTransient<ITokenProvider>(sp =>
        {
            var options = sp.GetRequiredService<IOptions<DynamicsTokenProviderOptions>>().Value;
            return options.AuthenticationType == DynamicsAuthenticationType.OnPremise
                ? sp.GetRequiredService<ADFSTokenProvider>()
                : sp.GetRequiredService<EntraIdTokenProvider>();
        });

        // Register Dataverse service
        services.AddSingleton<IOrganizationServiceAsync>(sp =>
        {
            var logger = sp.GetRequiredService<ILogger<ServiceClient>>();
            var options = sp.GetRequiredService<IOptions<DynamicsTokenProviderOptions>>().Value;
            var tokenProvider = sp.GetRequiredService<ITokenProvider>();

            var uri = new Uri(options.DynamicsApiEndpointUrl);
            var client = new ServiceClient(
                uri,
                async (instanceUri) => await tokenProvider.AcquireToken(),
                false,
                logger
            );

            if (!client.IsReady)
            {
                logger.LogError("Failed to connect to Dataverse: {Error}", client.LastError);
                throw new InvalidOperationException(
                    $"Failed to connect to Dataverse: {client.LastError}",
                    client.LastException
                );
            }

            return client;
        });

        return services;
    }
}
