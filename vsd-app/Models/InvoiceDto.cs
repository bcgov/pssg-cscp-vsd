namespace Gov.Cscp.VictimServices.Public.Models;

public class InvoiceDto
{
    public InvoiceDetailsDto InvoiceDetails { get; set; }
    public DocumentDto[] DocumentCollection { get; set; }
}
