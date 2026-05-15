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
        services.AddHttpClient("adfs_token");

        services.AddHttpClient("entraid_token");

        // Register both token providers
        services.AddTransient<ADFSTokenProvider>();
        services.AddTransient<EntraIdTokenProvider>();

        // Register the appropriate token provider based on configuration
        services.AddTransient<ITokenProvider>(sp =>
        {
            var options = sp.GetRequiredService<IOptions<DynamicsTokenProviderOptions>>();

            return options.Value.AuthenticationType switch
            {
                DynamicsAuthenticationType.OnPremise => sp.GetRequiredService<ADFSTokenProvider>(),
                DynamicsAuthenticationType.Cloud => sp.GetRequiredService<EntraIdTokenProvider>(),
                _ => throw new InvalidOperationException(
                    $"Unknown authentication type: {options.Value.AuthenticationType}"
                ),
            };
        });

        // Register Dataverse service
        services.AddSingleton<IOrganizationServiceAsync>(sp =>
        {
            var logger = sp.GetRequiredService<ILogger<ServiceClient>>();
            var options = sp.GetRequiredService<IOptions<DynamicsTokenProviderOptions>>().Value;
            var tokenProvider = sp.GetRequiredService<ITokenProvider>();

            var uri = new Uri(options.GetDynamicsApiEndpointUrl());
            var client = new ServiceClient(
                uri,
                async (instanceUri) => await tokenProvider.AcquireToken(),
                false,
                logger
            );

            if (!client.IsReady)
            {
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
