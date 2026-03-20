public enum ContactAddress1Code
{
    //[OptionSetMetadataAttribute("General Mailing Address", 3)]
    GeneralMailingAddress = 1,

    //[OptionSetMetadataAttribute("Other", 2)]
    Other = 4,

    //[OptionSetMetadataAttribute("Primary", 1)]
    Primary = 3,

    //[OptionSetMetadataAttribute("Ship To", 0)]
    ShipTo = 2,
}

public record FindContactQuery : BaseContactQuery, IRequest<Contact> { }
public record ContactQuery : BaseContactQuery, IRequest<IEnumerable<Contact>> { }
public record BaseContactQuery
{
    public Guid? Id { get; set; }

    /// <summary>
    /// Filter by identity-provider user ID.
    /// Stored in EmailAddress1 in Dynamics (temporary; will move to a dedicated field).
    /// </summary>
    public string? ExternalUserId { get; set; }
}

public record Contact : IDto
{
    public Guid Id { get; set; }
    public StateCode StateCode { get; set; }
    public string? FirstName { get; set; }              // Dynamics Business Recommended
    public required string LastName { get; set; }       // Dynamics Business Required
    public string? AccountNumber { get; set; }          // Dynamics Optional
    public string? InstitutionNumber { get; set; }      // Dynamics Optional
    public string? TransitNumber { get; set; }          // Dynamics Optional
    public required string ContactRole { get; set; }        // Dynamics Business Required
    public int? SupplierSiteNumber { get; set; }            // Dynamics Optional
    public string? RestChequeName { get; set; }             // Dynamics Optional
    public ContactAddress1Code? Address1Code { get; set; }  // Dynamics Optional
    public Address[]? Addresses { get; set; }               // Dynamics Business Recommended 'address1_line1'

    public string[]? Emails { get; set; }                   // Dynamics Business Recommended 'emailaddress1'. Dynamics Optional 'emailaddress2', and 'emailaddress3'
}