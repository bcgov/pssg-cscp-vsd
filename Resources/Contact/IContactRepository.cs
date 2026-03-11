namespace Resources;

public interface IContactRepository : IFindRepository<FindContactQuery, Contact>, IQueryRepository<ContactQuery, Contact>, IBaseRepository<Contact>
{
    /// <summary>
    /// Creates a minimal Contact entity directly in Dataverse.
    /// Bypasses the complex DTO→Entity mapping (Emails array, ContactRole enum) that
    /// does not reverse-map cleanly through AutoMapper.
    /// </summary>
    /// <param name="externalUserId">Identity-provider user ID (stored in EmailAddress1).</param>
    /// <param name="birthDate">Birth date (required by Dynamics workflow for Client contacts).</param>
    Guid InsertLocal(string externalUserId, string firstName, string lastName, DateTime birthDate);
}
