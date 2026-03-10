namespace Resources;

public class ApplicationDraftMapper : Profile
{
    public ApplicationDraftMapper()
    {
        // ── Dynamics entity → domain DTO ──────────────────────────────────────
        CreateMap<Vsd_VictimServiceDraft, ApplicationDraft>()
            .ForMember(dest => dest.Id,
                opts => opts.MapFrom(src => src.Vsd_VictimServiceDraftId ?? Guid.Empty))
            .ForMember(dest => dest.Name,
                opts => opts.MapFrom(src => src.Vsd_Name))
            .ForMember(dest => dest.DraftType,
                opts => opts.MapFrom(src => (DraftType?)src.Vsd_VictimServiceFormType))
            .ForMember(dest => dest.DraftData,
                opts => opts.MapFrom(src => src.Vsd_DraftData))
            .ForMember(dest => dest.DraftedDate,
                opts => opts.MapFrom(src => src.Vsd_DraftedDate))
            .ForMember(dest => dest.StateCode,
                opts => opts.MapFrom(src =>
                    src.StateCode == Vsd_VictimServiceDraft_StateCode.Active
                        ? StateCode.Active
                        : StateCode.Inactive))
            .ForMember(dest => dest.SubmitterId,
                opts => opts.MapFrom(src => src.Vsd_Submitter != null ? src.Vsd_Submitter.Id : (Guid?)null))
            .ForMember(dest => dest.CreatedOn,
                opts => opts.MapFrom(src => src.CreatedOn))
            .ForMember(dest => dest.ModifiedOn,
                opts => opts.MapFrom(src => src.ModifiedOn));

        // ── Domain DTO → Dynamics entity ─────────────────────────────────────
        CreateMap<ApplicationDraft, Vsd_VictimServiceDraft>()
            .ForMember(dest => dest.Vsd_VictimServiceDraftId,
                opts => opts.MapFrom(src => src.Id == Guid.Empty ? (Guid?)null : src.Id))
            .ForMember(dest => dest.Vsd_Name,
                opts => opts.MapFrom(src => src.Name))
            .ForMember(dest => dest.Vsd_VictimServiceFormType,
                opts => opts.MapFrom(src => (Vsd_VictimServiceFormType?)src.DraftType))
            .ForMember(dest => dest.Vsd_DraftData,
                opts => opts.MapFrom(src => src.DraftData))
            .ForMember(dest => dest.Vsd_DraftedDate,
                opts => opts.MapFrom(src => src.DraftedDate))
            .ForMember(dest => dest.Vsd_Submitter,
                opts => opts.MapFrom(src =>
                    src.SubmitterId != null
                        ? new EntityReference(Database.Model.Contact.EntityLogicalName, src.SubmitterId.Value)
                        : null))
            .ForMember(dest => dest.StateCode,
                opts => opts.MapFrom(src =>
                    src.StateCode == StateCode.Active
                        ? Vsd_VictimServiceDraft_StateCode.Active
                        : Vsd_VictimServiceDraft_StateCode.Inactive))
            .ForMember(dest => dest.StatusCode,
                opts => opts.MapFrom(src =>
                    src.StateCode == StateCode.Active
                        ? Vsd_VictimServiceDraft_StatusCode.Active
                        : Vsd_VictimServiceDraft_StatusCode.Inactive))
            // Read-only / system-managed fields – do not write these back
            .ForMember(dest => dest.CreatedOn, opts => opts.Ignore())
            .ForMember(dest => dest.ModifiedOn, opts => opts.Ignore())
            .ForMember(dest => dest.CreatedBy, opts => opts.Ignore())
            .ForMember(dest => dest.ModifiedBy, opts => opts.Ignore())
            .ForMember(dest => dest.OwnerId, opts => opts.Ignore())
            .ForMember(dest => dest.OwningBusinessUnit, opts => opts.Ignore())
            .ForMember(dest => dest.OwningTeam, opts => opts.Ignore())
            .ForMember(dest => dest.OwningUser, opts => opts.Ignore())
            .ForMember(dest => dest.VersionNumber, opts => opts.Ignore());
    }
}
