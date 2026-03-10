using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Reflection;
using System.Text;
using System.Text.Json.Serialization;
using Database;
using Gov.Cscp.VictimServices.Public.Services;
using Manager;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.CookiePolicy;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using NWebsec.AspNetCore.Mvc;
using NWebsec.AspNetCore.Mvc.Csp;
using Serilog;
using Serilog.Enrichers.Span;
using Serilog.Exceptions;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Gov.Cscp.VictimServices.Public
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // services needed for new Dynamics architecture
            services.AddAutoMapperMappings();
            services.AddHandlers();
            services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblyContaining<InvoiceHandlers>());
            services.AddDatabase(Configuration);

            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddTransient<Gov.Cscp.VictimServices.Public.Services.TokenHandler>();

            // Local auth service (temporary — will be replaced by Keycloak)
            services.AddSingleton<ILocalAuthService, LocalAuthService>();

            // JWT Bearer authentication
            var jwtSecret =
                Configuration["LocalAuth:Secret"]
                ?? throw new InvalidOperationException("LocalAuth:Secret is not configured.");
            var jwtIssuer = Configuration["LocalAuth:Issuer"] ?? "vsd-local";

            services
                .AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = jwtIssuer,
                        ValidAudience = jwtIssuer,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
                    };
                });

            services.AddHttpClient<ICOASTAuthService, COASTAuthService>();
            services
                .AddHttpClient<IDynamicsResultService, DynamicsResultService>()
                .AddHttpMessageHandler<Gov.Cscp.VictimServices.Public.Services.TokenHandler>();
            services.AddHttpClient<IAEMResultService, AEMResultService>();

            // Add a memory cache
            services.AddMemoryCache();

            // for security reasons, the following headers are set.
            services
                .AddMvc(opts =>
                {
                    opts.EnableEndpointRouting = false;
                    // default deny
                    var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
                    opts.Filters.Add(new AuthorizeFilter(policy));

                    opts.Filters.Add(typeof(NoCacheHttpHeadersAttribute));
                    opts.Filters.Add(new XRobotsTagAttribute() { NoIndex = true, NoFollow = true });
                    opts.Filters.Add(typeof(XContentTypeOptionsAttribute));
                    opts.Filters.Add(typeof(XDownloadOptionsAttribute));
                    opts.Filters.Add(typeof(XFrameOptionsAttribute));
                    opts.Filters.Add(typeof(XXssProtectionAttribute));
                    //CSPReportOnly
                    opts.Filters.Add(typeof(CspReportOnlyAttribute));
                    opts.Filters.Add(new CspScriptSrcReportOnlyAttribute { None = true });
                })
                .AddNewtonsoftJson(opts =>
                {
                    opts.SerializerSettings.Formatting = Newtonsoft.Json.Formatting.Indented;
                    opts.SerializerSettings.DateFormatHandling = Newtonsoft.Json.DateFormatHandling.IsoDateFormat;
                    opts.SerializerSettings.DateTimeZoneHandling = Newtonsoft.Json.DateTimeZoneHandling.Utc;

                    // ReferenceLoopHandling is set to Ignore to prevent JSON parser issues with the user / roles model.
                    opts.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
                })
                .AddJsonOptions(opts =>
                {
                    opts.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                });

            // setup key ring to persist in storage.
            if (!string.IsNullOrEmpty(Configuration["KEY_RING_DIRECTORY"]))
            {
                services
                    .AddDataProtection()
                    .PersistKeysToFileSystem(new DirectoryInfo(Configuration["KEY_RING_DIRECTORY"]));
            }

            // allow for large files to be uploaded
            services.Configure<FormOptions>(options =>
            {
                options.MultipartBodyLengthLimit = 1073741824; // 1 GB
            });

            // health checks
            services.AddHealthChecks().AddCheck("HTTP Endpoint", () => HealthCheckResult.Healthy("Ok"));

            services.AddSession();

            services.AddSerilog();

            // Add Swagger services
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc(
                    "v1",
                    new OpenApiInfo
                    {
                        Title = "VSD API",
                        Version = "v1",
                        Description = "API for the Victim Services Directory (VSD) application",
                    }
                );

                // Add Bearer token support to Swagger UI
                c.AddSecurityDefinition(
                    "Bearer",
                    new OpenApiSecurityScheme
                    {
                        Description = "JWT token obtained from POST /api/auth/login. Enter: Bearer {token}",
                        Name = "Authorization",
                        In = ParameterLocation.Header,
                        Type = SecuritySchemeType.ApiKey,
                        Scheme = "Bearer",
                    }
                );

                // Make Swagger UI send the Bearer token on every request
                c.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
                {
                    { new OpenApiSecuritySchemeReference("Bearer"), new List<string>() },
                });
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            ConfigureLogging(env);

            string pathBase = Configuration["BASE_PATH"];

            if (!string.IsNullOrEmpty(pathBase))
            {
                app.UsePathBase(pathBase);
            }
            if (!env.IsProduction())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseSerilogRequestLogging(options =>
            {
                // Reduce log level for specific endpoints
                options.GetLevel = (httpContext, elapsed, ex) =>
                {
                    if (ex != null)
                        return Serilog.Events.LogEventLevel.Error;

                    var path = httpContext.Request.Path.ToString();

                    // health checks and lookup endpoints
                    var logIgnoreEndpoints = new[] { "/hc", "/api/lookup" };

                    // Suppress logging for ignored endpoints
                    if (Array.Exists(logIgnoreEndpoints, e => path.StartsWith(e, StringComparison.OrdinalIgnoreCase)))
                    {
                        return Serilog.Events.LogEventLevel.Verbose; // Below minimum level
                    }

                    // log warnings for requests that take longer than 1 second
                    return elapsed > 1000
                        ? Serilog.Events.LogEventLevel.Warning
                        : Serilog.Events.LogEventLevel.Information;
                };

                options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
                {
                    diagnosticContext.Set("RequestHost", httpContext.Request.Host.Value);
                    diagnosticContext.Set("RequestScheme", httpContext.Request.Scheme);
                    diagnosticContext.Set("UserAgent", httpContext.Request.Headers["User-Agent"].ToString());
                };
            });

            // health checks
            app.UseHealthChecks("/hc");

            app.Use(
                async (ctx, next) =>
                {
                    ctx.Response.Headers.Append(
                        "Content-Security-Policy",
                        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://maxcdn.bootstrapcdn.com https://cdnjs.cloudflare.com https://code.jquery.com https://stackpath.bootstrapcdn.com https://fonts.googleapis.com"
                    );
                    ctx.Response.Headers.Append(
                        "Strict-Transport-Security",
                        "max-age=31536000; includeSubDomains; preload"
                    );
                    await next();
                }
            );
            app.UseXContentTypeOptions();
            app.UseXfo(xfo => xfo.Deny());

            if (!env.IsDevelopment()) // when running locally we can't have a strict CSP
            {
                // Content-Security-Policy header
                app.UseCsp(opts =>
                {
                    opts.BlockAllMixedContent()
                        .StyleSources(s =>
                            s.Self()
                                .UnsafeInline()
                                .CustomSources(
                                    "https://use.fontawesome.com",
                                    "https://stackpath.bootstrapcdn.com",
                                    "https://fonts.googleapis.com"
                                )
                        )
                        .FontSources(s =>
                            s.Self().CustomSources("https://use.fontawesome.com", "https://fonts.gstatic.com")
                        )
                        .FormActions(s => s.Self())
                        .FrameAncestors(s => s.Self())
                        .ImageSources(s => s.Self().CustomSources("data:"))
                        .DefaultSources(s => s.Self())
                        .ObjectSources(s => s.Self().CustomSources("data:"))
                        .FrameSources(s => s.Self().CustomSources("data:"))
                        .ScriptSources(s =>
                            s.Self()
                                .CustomSources(
                                    "https://apis.google.com",
                                    "https://maxcdn.bootstrapcdn.com",
                                    "https://cdnjs.cloudflare.com",
                                    "https://code.jquery.com",
                                    "https://stackpath.bootstrapcdn.com",
                                    "https://fonts.googleapis.com"
                                )
                        );
                });
            }

            app.UseXXssProtection(options => options.EnabledWithBlockMode());
            app.UseNoCacheHttpHeaders();
            // IMPORTANT: This session call MUST go before UseMvc()
            app.UseSession();

            app.UseAuthentication();

            app.UseCookiePolicy(
                new CookiePolicyOptions
                {
                    HttpOnly = HttpOnlyPolicy.Always,
                    Secure = CookieSecurePolicy.Always,
                    MinimumSameSitePolicy = Microsoft.AspNetCore.Http.SameSiteMode.None,
                }
            );

            app.UseMvc(routes =>
            {
                routes.MapRoute(name: "default", template: "{controller}/{action=Index}/{id?}");
            });

            // enable swagger only in development
            if (env.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "VSD API V1");
                });
            }
        }

        private void ConfigureLogging(IWebHostEnvironment env)
        {
            var loggerConfiguration = new LoggerConfiguration()
                .Enrich.FromLogContext()
                .Enrich.WithExceptionDetails()
                .Enrich.WithMachineName()
                .Enrich.WithProperty("app", "CVAP_VSD")
                .Enrich.WithProperty("environment", env.EnvironmentName)
                .Enrich.WithEnvironmentUserName()
                .Enrich.WithCorrelationId()
                .Enrich.WithSpan()
                .Enrich.WithProperty(
                    "version",
                    Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "Unknown"
                )
                .Enrich.WithProperty("UTC_Timestamp", DateTime.UtcNow.ToString("o"));

            // Set minimum level based on environment
            if (env.IsDevelopment())
            {
                loggerConfiguration.MinimumLevel.Debug();
            }
            else
            {
                loggerConfiguration.MinimumLevel.Information();
            }

            // Override for specific namespaces
            loggerConfiguration
                .MinimumLevel.Override("Microsoft", Serilog.Events.LogEventLevel.Warning)
                .MinimumLevel.Override("System", Serilog.Events.LogEventLevel.Warning);

            loggerConfiguration.WriteTo.Console();

            var splunkCollectorUrl = Configuration["SPLUNK_COLLECTOR_URL"];
            var splunkToken = Configuration["SPLUNK_TOKEN"];

            if (!string.IsNullOrEmpty(splunkCollectorUrl) && !string.IsNullOrEmpty(splunkToken))
            {
                // Use proper certificate validation or provide custom validator
                HttpClientHandler? handler = null;

                if (env.IsDevelopment())
                {
                    handler = new HttpClientHandler
                    {
                        ServerCertificateCustomValidationCallback =
                            HttpClientHandler.DangerousAcceptAnyServerCertificateValidator,
                    };
                }

                loggerConfiguration.WriteTo.EventCollector(
                    splunkHost: splunkCollectorUrl,
                    eventCollectorToken: splunkToken,
                    sourceType: "coast:vsd:api",
                    restrictedToMinimumLevel: Serilog.Events.LogEventLevel.Information,
                    messageHandler: handler,
                    batchSizeLimit: 100,
                    batchIntervalInSeconds: 2
                );
            }

            Log.Logger = loggerConfiguration.CreateLogger();

            Serilog.Debugging.SelfLog.Enable(msg =>
            {
                Console.Error.WriteLine($"Serilog Error: {msg}");
            });

            Log.Logger.Information("VSD API Started");
        }
    }
}
