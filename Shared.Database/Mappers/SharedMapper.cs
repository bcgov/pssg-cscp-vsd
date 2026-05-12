namespace Shared.Database;

public class SharedMapper : Profile
{
    public SharedMapper()
    {
        RecognizeDestinationPrefixes("Vsd_");
        RecognizePrefixes("Vsd_");

        RecognizeDestinationPostfixes("Id");
        RecognizePostfixes("Id");

        CreateMap<Money, decimal>().ConvertUsing(src => src.Value);
        CreateMap<Money, decimal?>().ConvertUsing(src => src != null ? src.Value : null);
        CreateMap<EntityReference, Guid>().ConvertUsing(src => src.Id);
        CreateMap<EntityReference, Guid?>().ConvertUsing(src => src.Id);
        CreateMap<DynamicReference, EntityReference>().ConvertUsing(src => new EntityReference(src.SchemaName, src.Id));
        CreateMap<DynamicReference?, EntityReference>()
            .ConvertUsing(src => src != null ? new EntityReference(src.SchemaName, src.Id) : null);
        CreateMap<EntityReference, DynamicReference>()
            .ConvertUsing(src => new DynamicReference(src.Id, src.LogicalName));
        CreateMap<StaticReference, EntityReference>().ConvertUsing(src => new EntityReference(src.SchemaName, src.Id));
        CreateMap<EntityReference, StaticReference>().ConvertUsing(src => new StaticReference(src.Id, src.LogicalName));
        CreateMap<StaticReference?, EntityReference>()
            .ConvertUsing(src => src != null ? new EntityReference(src.SchemaName, src.Id) : null);
        CreateMap<EntityReference, StaticReference?>()
            .ConvertUsing(src => src != null ? new StaticReference(src.Id, src.LogicalName) : null);
    }
}
