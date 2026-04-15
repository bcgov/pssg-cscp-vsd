using Gov.Cscp.VictimServices.Public.Services;
using Manager;
using Manager.Contract;
using Microsoft.Extensions.DependencyInjection;
using Resources;
using Shared.Database;
using Utilities;

namespace Gov.Cscp.VictimServices.Public;

public static class ServiceCollectionExtensions
{
    // TODO rename to AddHandlersAndRepositories (but it also has MessageRequests, maybe rename to AddServices)
    public static IServiceCollection AddHandlers(this IServiceCollection services)
    {
        services.AddTransient<AccountHandlers>();
        services.AddTransient<IAccountRepository, AccountRepository>();

        services.AddTransient<CvapStobHandlers>();
        services.AddTransient<ICvapStobRepository, CvapStobRepository>();

        services.AddTransient<ICasPaymentRepository, CasPaymentRepository>();

        services.AddTransient<ContractHandlers>();
        services.AddTransient<IContractRepository, ContractRepository>();

        services.AddTransient<IConfigurationRepository, ConfigurationRepository>();
        services.AddTransient<IConfigurationService, ConfigurationService>();

        services.AddTransient<ContactHandlers>();
        services.AddTransient<IContactRepository, ContactRepository>();

        services.AddTransient<CurrencyHandlers>();
        services.AddTransient<ICurrencyRepository, CurrencyRepository>();

        services.AddTransient<CountryHandlers>();
        services.AddTransient<ICountryRepository, CountryRepository>();

        services.AddTransient<IEntitlementRepository, EntitlementRepository>();

        services.AddTransient<IIncomeSupportParameterRepository, IncomeSupportParameterRepository>();

        services.AddTransient<InvoiceHandlers>();
        services.AddTransient<IInvoiceRepository, InvoiceRepository>();

        services.AddTransient<InvoiceLineDetailHandlers>();
        services.AddTransient<IInvoiceLineDetailRepository, InvoiceLineDetailRepository>();

        services.AddTransient<PaymentHandlers>();
        services.AddTransient<IPaymentService, PaymentService>();
        services.AddTransient<IPaymentRepository, PaymentRepository>();

        services.AddTransient<IPaymentScheduleRepository, PaymentScheduleRepository>();
        services.AddTransient<IPaymentScheduleService, PaymentScheduleService>();

        services.AddTransient<ProgramHandlers>();
        services.AddTransient<IProgramRepository, ProgramRepository>();

        services.AddTransient<ProgramTypeHandlers>();
        services.AddTransient<IProgramTypeRepository, ProgramTypeRepository>();

        services.AddTransient<IProvinceRepository, ProvinceRepository>();

        services.AddTransient<ScheduleGHandlers>();
        services.AddTransient<IScheduleGRepository, ScheduleGRepository>();

        services.AddTransient<TaskHandlers>();
        services.AddTransient<ITaskRepository, TaskRepository>();

        services.AddTransient<ITeamRepository, TeamRepository>();

        services.AddTransient<IApplicationDraftRepository, ApplicationDraftRepository>();

        services.AddTransient<IMessageRequests, MessageRequests>();
        services.AddSingleton<ICasHttpClient, CasHttpClient>();

        services.AddTransient<ILookupService, LookupService>();

        return services;
    }

    public static IServiceCollection AddAutoMapperMappings(this IServiceCollection services)
    {
        // NOTE global and shared mapper should be first, since it has the prefix configurations and shared mappings
        // TODO consider adding an assembly scan for all mappers
        var mapperTypes = new[]
        {
            typeof(SharedMapper),
            typeof(TeamMapper),
            typeof(PaymentScheduleMapper),
            typeof(EntitlementMapper),
            typeof(IncomeSupportParameterMapper),
            typeof(CurrencyMapper),
            typeof(PaymentMapper),
            typeof(AccountMapper),
            typeof(ContactMapper),
            typeof(ProgramMapper),
            typeof(ContractRepositoryMapper),
            typeof(InvoiceMapper),
            typeof(InvoiceLineDetailMapper),
            typeof(ScheduleGRepositoryMapper),
            typeof(ProgramTypeMapper),
            typeof(ProvinceMapper),
            typeof(CountryMapper),
            typeof(TaskRepositoryMapper),
            typeof(ConfigurationMapper),
            typeof(CasPaymentMapper),
            typeof(CvapStobMapper),
            typeof(ApplicationDraftMapper),
        };
        services.AddAutoMapper(cfg => cfg.ShouldUseConstructor = constructor => constructor.IsPublic, mapperTypes);
        return services;
    }
}
