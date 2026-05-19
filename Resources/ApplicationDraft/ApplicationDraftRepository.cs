using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace Resources;

public class ApplicationDraftRepository : BaseRepository<Vsd_VictimServiceDraft, ApplicationDraft>, IApplicationDraftRepository
{
    private readonly DatabaseContext _databaseContext;
    private readonly ILogger<ApplicationDraftRepository> _logger;

    public ApplicationDraftRepository(DatabaseContext databaseContext, IMapper mapper, ILogger<ApplicationDraftRepository> logger)
        : base(databaseContext, mapper)
    {
        _databaseContext = databaseContext;
        _logger = logger;
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

        var drafts = _mapper.Map<IEnumerable<ApplicationDraft>>(results).ToList();

        foreach (var d in drafts)
            d.ApplicantLabel = ExtractApplicantLabel(d.DraftData, d.Id);

        return drafts;
    }

    // ── ExtractApplicantLabel ────────────────────────────────────────────────

    /// <summary>
    /// Extract <c>personalInformation.lastName</c> from the
    /// stored draft JSON.  Returns <c>null</c> when the field is absent, empty,
    /// or the JSON cannot be parsed.
    /// </summary>
    private string? ExtractApplicantLabel(string? draftData, Guid draftId)
    {
        if (string.IsNullOrWhiteSpace(draftData))
            return null;

        try
        {
            using var doc = JsonDocument.Parse(draftData);
            if (doc.RootElement.TryGetProperty("personalInformation", out var pi) &&
                pi.TryGetProperty("lastName", out var ln))
            {
                var value = ln.GetString();
                return string.IsNullOrWhiteSpace(value) ? null : value;
            }
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to parse draftData JSON for applicant label extraction on draft {DraftId}", draftId);
        }

        return null;
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
