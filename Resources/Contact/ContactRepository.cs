namespace Resources;

public class ContactRepository : BaseRepository<Database.Model.Contact, Contact>, IContactRepository
{
    private readonly DatabaseContext _databaseContext;

    public ContactRepository(DatabaseContext databaseContext, IMapper mapper) : base(databaseContext, mapper)
    {
        _databaseContext = databaseContext;
    }

    public Contact FirstOrDefault(FindContactQuery query)
    {
        var entity = _databaseContext.ContactSet
            .Where(query)
            .FirstOrDefault();
        return _mapper.Map<Contact>(entity);
    }

    public IEnumerable<Contact> Query(ContactQuery query)
    {
        var entities = _databaseContext.ContactSet
            .Where(query)
            .ToList();
        return _mapper.Map<IEnumerable<Contact>>(entities);
    }

    /// <inheritdoc />
    public Guid InsertLocal(string externalUserId, string firstName, string lastName, DateTime birthDate)
    {
        var entity = new Database.Model.Contact
        {
            FirstName = firstName,
            LastName = lastName,
            Birthdate = birthDate,
            EmailAddress1 = externalUserId,
            Vsd_ContactRole = Contact_Vsd_ContactRole.Client,
        };
        _databaseContext.AddObject(entity);
        _databaseContext.SaveChanges();
        return entity.Id;
    }
}

public static class ContactExtensions
{
    public static IQueryable<Database.Model.Contact> Where(this IQueryable<Database.Model.Contact> query, BaseContactQuery contactQuery)
    {
        return query
            .WhereIf(contactQuery.Id != null, c => c.Id == contactQuery.Id)
            .WhereIf(contactQuery.ExternalUserId != null, c => c.EmailAddress1 == contactQuery.ExternalUserId);
    }
}
