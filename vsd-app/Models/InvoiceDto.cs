using System;
using Database.Model;
using Gov.Cscp.VictimServices.Public.Models.Enums;

namespace Gov.Cscp.VictimServices.Public.Models
{
    public class InvoiceDto
    {
        public InvoiceDetailsDto InvoiceDetails { get; set; }
        public DocumentDto[] DocumentCollection { get; set; }
    }

    public class InvoiceDetailsDto
    {
        public string VendorNumber { get; set; }
        public string VendorPostalCode { get; set; }
        public string CounselorNumber { get; set; }
        public string CounselorLastName { get; set; }
        public string ClaimNumber { get; set; }
        public string ClaimantFirstName { get; set; }
        public string ClaimantLastName { get; set; }
        public string InvoiceNumber { get; set; }
        public DateTime InvoicedAte { get; set; }
        public bool ExemptFromGst { get; set; }
        public string SubmitterFullName { get; set; }
        public string SubmitterEmailAddress { get; set; }
        public InvoiceLineItemDto[] InvoiceLineItems { get; set; }
    }

    public class InvoiceLineItemDto
    {
        public CounsellingType CounsellingType { get; set; }
        public DateTime SessionDate { get; set; }
        public decimal? SessionHours { get; set; }
        public bool MissedSession { get; set; }
        public string AttendingSupportPerson { get; set; }
    }

    public class DocumentDto
    {
        public string FileName { get; set; }
        public string Body { get; set; }
        public string Subject { get; set; }
    }
}
