namespace Resources;

public class ApplicationDraftRepository : BaseRepository<Vsd_VictimServiceDraft, ApplicationDraft>, IApplicationDraftRepository
{
    private readonly DatabaseContext _databaseContext;

    public ApplicationDraftRepository(DatabaseContext databaseContext, IMapper mapper)
        : base(databaseContext, mapper)
    {
        _databaseContext = databaseContext;
    }

    // ── Insert ────────────────────────────────────────────────────────────────

    public override Guid Insert(ApplicationDraft draft)
    {
        var entity = _mapper.Map<Vsd_VictimServiceDraft>(draft);
        _databaseContext.AddObject(entity);
        _databaseContext.SaveChanges();
        return entity.Id;
    }

    // ── Query ────────────────────────────────────────────────────────────────

    public IEnumerable<ApplicationDraft> Query(ApplicationDraftQuery query)
    {
        var results = _databaseContext.Vsd_VictimServiceDraftSet
            .WhereIf(query.Id != null,
                e => e.Vsd_VictimServiceDraftId == query.Id)
            .WhereIf(query.SubmitterId != null,
                e => e.Vsd_Submitter != null && e.Vsd_Submitter.Id == query.SubmitterId)
            .WhereIf(query.ActiveOnly,
                e => e.StateCode == Vsd_VictimServiceDraft_StateCode.Active)
            .ToList();

        return _mapper.Map<IEnumerable<ApplicationDraft>>(results);
    }

    // ── Cancel (soft-delete) ─────────────────────────────────────────────────

    public bool Cancel(Guid draftId)
    {
        var entity = _databaseContext.Vsd_VictimServiceDraftSet
            .FirstOrDefault(e => e.Vsd_VictimServiceDraftId == draftId);

        if (entity == null)
            return false;

        entity.StateCode = Vsd_VictimServiceDraft_StateCode.Inactive;
        entity.StatusCode = Vsd_VictimServiceDraft_StatusCode.Inactive;
        _databaseContext.UpdateObject(entity);
        _databaseContext.SaveChanges();
        return true;
    }
}
