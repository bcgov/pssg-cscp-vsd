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

    // ── Update ───────────────────────────────────────────────────────────────
    // Override required because Query() causes the context to track the entity.
    // When the base Update() maps the DTO back to a NEW entity instance and
    // tries to Attach it, the context rejects it ("already tracking a different
    // entity with the same identity"). Detach any tracked instance first.

    public override bool Update(ApplicationDraft dto)
    {
        var entity = _mapper.Map<Vsd_VictimServiceDraft>(dto);

        var tracked = _databaseContext.Vsd_VictimServiceDraftSet
            .FirstOrDefault(e => e.Vsd_VictimServiceDraftId == entity.Id);

        if (tracked != null)
            _databaseContext.Detach(tracked);

        _databaseContext.Attach(entity);
        _databaseContext.UpdateObject(entity);
        return !_databaseContext.SaveChanges().HasError;
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
