using System;
using System.ComponentModel.DataAnnotations;

namespace Gov.Cscp.VictimServices.Public.Models;

public class InvoiceDetailsDto
{
    [Required]
    public string VendorNumber { get; set; }

    [Required]
    public string VendorPostalCode { get; set; }

    [Required]
    public string CounsellorRegistrationNumber { get; set; }

    [Required]
    public string CounsellorLastName { get; set; }

    [Required]
    public string ClaimNumber { get; set; }

    [Required]
    public string ClaimantsFirstName { get; set; }

    [Required]
    public string ClaimantsLastName { get; set; }

    public string ClaimantsFullName { get; set; }

    [Required]
    public string InvoiceNumber { get; set; }

    [Required]
    public DateTime InvoiceDate { get; set; }

    public bool ExemptFromGst { get; set; }

    // TODO: how are these two fields used? Are they both needed?
    public bool GstApplicable { get; set; }

    [Required]
    public string SubmitterFullName { get; set; }

    [Required, EmailAddress]
    public string SubmitterEmailAddress { get; set; }

    public InvoiceLineItemDto[] LineItems { get; set; }

    public bool DeclaredAndSigned { get; set; }
}
