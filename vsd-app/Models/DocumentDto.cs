using System.ComponentModel.DataAnnotations;

namespace Gov.Cscp.VictimServices.Public.Models;

public class DocumentDto
{
    [Required]
    public string FileName { get; set; }

    [Required]
    public string Body { get; set; }

    [Required]
    public string Subject { get; set; }
}
