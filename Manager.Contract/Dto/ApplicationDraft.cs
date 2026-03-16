namespace Manager.Contract;

/// <summary>
/// Discriminates the kind of draft being saved.
/// Maps to the vsd_victimserviceformtype option set on the Dynamics entity.
/// Invoice drafts and application drafts share the same underlying Dataverse record
/// type; this enum determines how the payload is interpreted.
/// </summary>
public enum DraftType
{
    Invoice = 100000000,
    VictimApplication = 100000001,
    WitnessApplication = 100000002,
    FamilyMemberApplication = 100000003,
}

/// <summary>
/// Domain DTO for a single vsd_victimservicedraft record.
/// Used for both application drafts and invoice drafts.
/// </summary>
public record ApplicationDraft : IDto
{
    public Guid Id { get; set; }
    public StateCode StateCode { get; set; }

    /// <summary>Draft type – distinguishes invoice drafts from application drafts.</summary>
    public DraftType? DraftType { get; set; }

    /// <summary>Serialised JSON form data stored in vsd_draftdata.</summary>
    public string? DraftData { get; set; }

    /// <summary>Date the draft was first saved (vsd_drafteddate).</summary>
    public DateTime? DraftedDate { get; set; }

    /// <summary>Submitter contact reference (vsd_submitter).</summary>
    public Guid? SubmitterId { get; set; }

    public DateTime? CreatedOn { get; set; }
    public DateTime? ModifiedOn { get; set; }
}

/// <summary>
/// Query parameters used when listing drafts.
/// </summary>
public record ApplicationDraftQuery : IRequest<IEnumerable<ApplicationDraft>>
{
    /// <summary>Filter to a specific draft by primary key.</summary>
    public Guid? Id { get; set; }

    /// <summary>Filter to drafts for a specific submitter contact.</summary>
    public Guid? SubmitterId { get; set; }

    /// <summary>When true only Active (non-cancelled) drafts are returned.</summary>
    public bool ActiveOnly { get; set; } = true;
}
