using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using Database;
using Gov.Cscp.VictimServices.Public.HealthChecks;
using Gov.Cscp.VictimServices.Public.Services;
using Manager;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.CookiePolicy;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
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
    public class Program
    {
        public static void Main(string[] args)
        {
            // Bootstrap logger captures startup errors before the full Serilog pipeline is ready.
            Log.Logger = new LoggerConfiguration().MinimumLevel.Debug().WriteTo.Console().CreateBootstrapLogger();

            try
            {
                var builder = WebApplication.CreateBuilder(args);

                // ── Serilog ───────────────────────────────────────────────────────────────
                builder.Host.UseSerilog(
                    (ctx, _, loggerConfiguration) =>
                    {
                        var hostEnv = ctx.HostingEnvironment;
                        var config = ctx.Configuration;

                        loggerConfiguration
                            .Enrich.FromLogContext()
                            .Enrich.WithExceptionDetails()
                            .Enrich.WithMachineName()
                            .Enrich.WithProperty("app", "CVAP_VSD")
                            .Enrich.WithProperty("environment", hostEnv.EnvironmentName)
                            .Enrich.WithEnvironmentUserName()
                            .Enrich.WithCorrelationId()
                            .Enrich.WithSpan()
                            .Enrich.WithProperty(
                                "version",
                                Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "Unknown"
                            )
                            .Enrich.WithProperty("UTC_Timestamp", DateTime.UtcNow.ToString("o"));

                        if (hostEnv.IsDevelopment())
                            loggerConfiguration.MinimumLevel.Debug();
                        else
                            loggerConfiguration.MinimumLevel.Information();

                        loggerConfiguration
                            .MinimumLevel.Override("Microsoft", Serilog.Events.LogEventLevel.Warning)
                            .MinimumLevel.Override("System", Serilog.Events.LogEventLevel.Warning);

                        loggerConfiguration.WriteTo.Console();

                        var splunkCollectorUrl = config["SPLUNK_COLLECTOR_URL"];
                        var splunkToken = config["SPLUNK_TOKEN"];

                        if (!string.IsNullOrEmpty(splunkCollectorUrl) && !string.IsNullOrEmpty(splunkToken))
                        {
                            HttpClientHandler? handler = null;

                            if (hostEnv.IsDevelopment())
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

                        Serilog.Debugging.SelfLog.Enable(msg => Console.Error.WriteLine($"Serilog Error: {msg}"));
                    }
                );

                // ── Services ──────────────────────────────────────────────────────────────
                builder.Services.AddAutoMapperMappings();
                builder.Services.AddHandlers();
                builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblyContaining<InvoiceHandlers>());
                builder.Services.AddDatabase(builder.Configuration);

                builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
                builder.Services.AddTransient<Services.TokenHandler>();

                // Contact lookup service — resolves JWT username → Dynamics Contact GUID
                builder.Services.AddScoped<IContactLookupService, ContactLookupService>();

                if (
                    bool.TryParse(builder.Configuration["FEATURE_USE_AUTHENTICATION"], out var useAuthentication)
                    && useAuthentication
                )
                {
                    builder
                        .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                        .AddJwtBearer(options =>
                        {
                            options.Authority = builder.Configuration["auth:jwt:authority"];
                            options.Audience = builder.Configuration["auth:jwt:audience"];
                            options.MapInboundClaims = false;
                            options.RequireHttpsMetadata = true;
                            options.TokenValidationParameters = new TokenValidationParameters
                            {
                                ValidateIssuer = true,
                                ValidateAudience = false,
                                ValidateLifetime = true,
                                ValidateIssuerSigningKey = true,
                            };
                        });
                }

                builder.Services.AddHttpClient<ICOASTAuthService, COASTAuthService>();
                builder.Services.AddHttpClient<IAEMResultService, AEMResultService>();
                builder.Services.AddMemoryCache();

                // For security reasons, the following headers are set.
                builder
                    .Services.AddMvc(opts =>
                    {
                        opts.EnableEndpointRouting = false;
                        // default deny
                        var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();

                        opts.Filters.Add(typeof(NoCacheHttpHeadersAttribute));
                        opts.Filters.Add(new XRobotsTagAttribute() { NoIndex = true, NoFollow = true });
                        opts.Filters.Add(typeof(XContentTypeOptionsAttribute));
                        opts.Filters.Add(typeof(XDownloadOptionsAttribute));
                        opts.Filters.Add(typeof(XFrameOptionsAttribute));
                        opts.Filters.Add(typeof(XXssProtectionAttribute));
                        opts.Filters.Add(typeof(CspReportOnlyAttribute));
                        opts.Filters.Add(new CspScriptSrcReportOnlyAttribute { None = true });
                    })
                    .AddNewtonsoftJson(opts =>
                    {
                        opts.SerializerSettings.Formatting = Newtonsoft.Json.Formatting.Indented;
                        opts.SerializerSettings.DateFormatHandling = Newtonsoft.Json.DateFormatHandling.IsoDateFormat;
                        opts.SerializerSettings.DateTimeZoneHandling = Newtonsoft.Json.DateTimeZoneHandling.Utc;
                        opts.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
                    })
                    .AddJsonOptions(opts =>
                    {
                        opts.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                    });

                // Setup key ring to persist in storage.
                if (!string.IsNullOrEmpty(builder.Configuration["KEY_RING_DIRECTORY"]))
                {
                    builder
                        .Services.AddDataProtection()
                        .PersistKeysToFileSystem(new DirectoryInfo(builder.Configuration["KEY_RING_DIRECTORY"]));
                }

                // Allow for large files to be uploaded.
                builder.Services.Configure<FormOptions>(options =>
                {
                    options.MultipartBodyLengthLimit = 1073741824; // 1 GB
                });

                // Health checks
                builder
                    .Services.AddHealthChecks()
                    .AddCheck<ApiSelfHealthCheck>(
                        "API",
                        failureStatus: HealthStatus.Degraded,
                        tags: new[] { "self", "process" }
                    )
                    .AddCheck<DataverseHealthCheck>(
                        "Dataverse",
                        failureStatus: HealthStatus.Unhealthy,
                        tags: new[] { "dataverse", "dynamics", "ready" }
                    );

                builder.Services.AddSession();
                builder.Services.AddSerilog();

                // Add Swagger services
                builder.Services.AddSwaggerGen(c =>
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

                    c.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
                    {
                        { new OpenApiSecuritySchemeReference("Bearer"), new List<string>() },
                    });
                });

                // ── Build ─────────────────────────────────────────────────────────────────
                var app = builder.Build();
                var env = app.Environment;

                // ── Middleware pipeline ───────────────────────────────────────────────────
                var pathBase = builder.Configuration["BASE_PATH"];

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
                    options.GetLevel = (httpContext, elapsed, ex) =>
                    {
                        if (ex != null)
                            return Serilog.Events.LogEventLevel.Error;

                        var path = httpContext.Request.Path.ToString();

                        if (path.StartsWith("/hc", StringComparison.OrdinalIgnoreCase))
                            return httpContext.Response.StatusCode >= 500
                                ? Serilog.Events.LogEventLevel.Error
                                : Serilog.Events.LogEventLevel.Verbose;

                        if (path.StartsWith("/api/lookup", StringComparison.OrdinalIgnoreCase))
                            return Serilog.Events.LogEventLevel.Verbose;

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

                app.UseHealthChecks(
                    "/hc",
                    new HealthCheckOptions
                    {
                        // Return HTTP 200 for all statuses so the pod is never killed by the
                        // load-balancer solely because Dataverse is temporarily unavailable.
                        ResultStatusCodes =
                        {
                            [HealthStatus.Healthy] = 200,
                            [HealthStatus.Degraded] = 200,
                            [HealthStatus.Unhealthy] = 200,
                        },
                        ResponseWriter = async (context, report) =>
                        {
                            // Overall HTTP status is driven by the API self-check only.
                            // Dataverse failures surface in per-check details without
                            // flipping the pod to Unhealthy (which would cause a restart).
                            var overallStatus = report.Entries.TryGetValue("API", out var apiEntry)
                                ? apiEntry.Status
                                : report.Status;

                            context.Response.StatusCode = overallStatus == HealthStatus.Unhealthy ? 503 : 200;
                            context.Response.ContentType = "application/json";

                            var result = JsonSerializer.Serialize(
                                new
                                {
                                    status = overallStatus.ToString(),
                                    checks = report.Entries.Select(e => new
                                    {
                                        name = e.Key,
                                        status = e.Value.Status.ToString(),
                                        description = e.Value.Description,
                                    }),
                                },
                                new JsonSerializerOptions { WriteIndented = true }
                            );

                            await context.Response.WriteAsync(result);
                        },
                    }
                );

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

                // IMPORTANT: UseSession MUST go before UseMvc()
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

                // Enable Swagger only in development
                if (env.IsDevelopment())
                {
                    app.UseSwagger();
                    app.UseSwaggerUI(c =>
                    {
                        c.SwaggerEndpoint("/swagger/v1/swagger.json", "VSD API V1");
                    });
                }

                Log.Information("VSD API Started");

                app.Run();
            }
            catch (Exception ex)
            {
                Log.Fatal(ex, "Application start-up failed");
            }
            finally
            {
                Log.CloseAndFlush();
            }
        }
    }
}
