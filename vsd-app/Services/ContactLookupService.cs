using System;
using Manager.Contract;
using Resources;
using Serilog;

namespace Gov.Cscp.VictimServices.Public.Services
{
    /// <summary>
    /// Resolves the Dynamics Contact GUID for the currently authenticated local user.
    /// On first access the Contact is lazily created in Dataverse and reused thereafter.
    /// </summary>
    public interface IContactLookupService
    {
        /// <summary>
        /// Returns the Contact GUID for the given identity-provider <paramref name="userId"/>,
        /// or <c>null</c> if no Contact record exists yet.
        /// </summary>
        Guid? GetContactId(string userId);

        /// <summary>
        /// Returns the existing Contact GUID for the given <paramref name="userId"/>;
        /// if no Contact exists, creates a minimal one and returns the new GUID.
        /// </summary>
        Guid GetOrCreateContactId(string userId, string displayName, DateTime birthDate);
    }

    public class ContactLookupService : IContactLookupService
    {
        private readonly IContactRepository _contactRepository;
        private readonly ILogger _logger;

        public ContactLookupService(IContactRepository contactRepository)
        {
            _contactRepository = contactRepository;
            _logger = Log.Logger;
        }

        public Guid? GetContactId(string userId)
        {
            var contact = _contactRepository.FirstOrDefault(new FindContactQuery { ExternalUserId = userId });

            if (contact == null || contact.Id == Guid.Empty)
                return null;

            return contact.Id;
        }

        public Guid GetOrCreateContactId(string userId, string displayName, DateTime birthDate)
        {
            var existing = GetContactId(userId);
            if (existing.HasValue)
                return existing.Value;

            // Split display name into first / last (fallback to userId for last name)
            var parts = (displayName ?? userId).Split(' ', 2);
            var firstName = parts[0];
            var lastName = parts.Length > 1 ? parts[1] : userId;

            _logger.Information(
                "Creating Contact for IdP user '{UserId}' ({FirstName} {LastName}).",
                userId,
                firstName,
                lastName
            );

            return _contactRepository.InsertLocal(userId, firstName, lastName, birthDate);
        }
    }
}
