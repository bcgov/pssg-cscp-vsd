using System;
using System.ComponentModel.DataAnnotations;
using Gov.Cscp.VictimServices.Public.Models.Enums;

namespace Gov.Cscp.VictimServices.Public.Models;

public class InvoiceLineItemDto
{
    [Required]
    public CounsellingType CounsellingType { get; set; }

    // TODO: temp field to capture the counselling type name for PDF generation
    public string CounsellingTypeName { get; set; }

    [Required]
    public DateTime SessionDate { get; set; }

    [Required]
    public decimal? SessionHours { get; set; }

    public decimal? SessionAmount { get; set; }

    public bool MissedSession { get; set; }

    public string AttendingSupportPerson { get; set; }
}
