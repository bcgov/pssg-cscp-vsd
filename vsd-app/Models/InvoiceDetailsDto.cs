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
    public string CounselorNumber { get; set; }

    [Required]
    public string CounselorLastName { get; set; }

    [Required]
    public string ClaimNumber { get; set; }

    [Required]
    public string ClaimantFirstName { get; set; }

    [Required]
    public string ClaimantLastName { get; set; }

    [Required]
    public string InvoiceNumber { get; set; }

    [Required]
    public DateTime InvoicedAte { get; set; }
    public bool ExemptFromGst { get; set; }

    [Required]
    public string SubmitterFullName { get; set; }

    [Required, EmailAddress]
    public string SubmitterEmailAddress { get; set; }
    public InvoiceLineItemDto[] InvoiceLineItems { get; set; }
}
