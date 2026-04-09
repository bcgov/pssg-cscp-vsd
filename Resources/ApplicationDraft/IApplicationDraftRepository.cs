namespace Resources;

public interface IApplicationDraftRepository
    : IQueryRepository<ApplicationDraftQuery, ApplicationDraft>,
      IBaseRepository<ApplicationDraft>
{
    /// <summary>
    /// Soft-cancels a draft by setting its status to Inactive.
    /// Returns false when the record does not exist.
    /// </summary>
    bool Cancel(Guid draftId);
}
