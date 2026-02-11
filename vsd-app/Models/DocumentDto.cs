using System.ComponentModel.DataAnnotations;

namespace Gov.Cscp.VictimServices.Public.Models;

public class DocumentDto
{
    [Required]
    public string Filename { get; set; }

    [Required]
    public string Body { get; set; }

    public string Subject { get; set; }
}
