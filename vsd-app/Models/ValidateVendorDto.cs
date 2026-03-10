namespace Gov.Cscp.VictimServices.Public.Models;

public class ValidateVendorDto
{
    public string VendorNumber { get; set; }
    public string VendorPostalCode { get; set; }
}

public class ValidateVendorAndCounsellorDto : ValidateVendorDto
{
    public string CounsellorNumber { get; set; }
    public string CounsellorLastName { get; set; }
}
