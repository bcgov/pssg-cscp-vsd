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
        {
            var (lastName, firstName) = ExtractApplicantNames(d.DraftData, d.Id);
            d.ApplicantLastName = lastName;
            d.ApplicantFirstName = firstName;
        }

        return drafts;
    }

    // ── ExtractApplicantNames ────────────────────────────────────────────────

    /// <summary>
    /// Extracts <c>personalInformation.lastName</c> and
    /// <c>personalInformation.firstName</c> from the stored draft JSON in a
    /// single parse pass.  Returns <c>(null, null)</c> when the fields are
    /// absent, empty, or the JSON cannot be parsed.
    /// </summary>
    private (string? lastName, string? firstName) ExtractApplicantNames(string? draftData, Guid draftId)
    {
        if (string.IsNullOrWhiteSpace(draftData))
            return (null, null);

        try
        {
            using var doc = JsonDocument.Parse(draftData);
            if (doc.RootElement.TryGetProperty("personalInformation", out var pi))
            {
                string? lastName = null;
                string? firstName = null;

                if (pi.TryGetProperty("lastName", out var ln))
                {
                    var v = ln.GetString();
                    lastName = string.IsNullOrWhiteSpace(v) ? null : v;
                }

                if (pi.TryGetProperty("firstName", out var fn))
                {
                    var v = fn.GetString();
                    firstName = string.IsNullOrWhiteSpace(v) ? null : v;
                }

                return (lastName, firstName);
            }
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to parse draftData JSON for applicant name extraction on draft {DraftId}", draftId);
        }

        return (null, null);
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
