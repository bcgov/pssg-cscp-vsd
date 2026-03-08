using Database.Model;

namespace Gov.Cscp.VictimServices.Public.Models.Extensions;

public static class ValidateVendorDtoExtensions
{
    public static Vsd_CheckVendorStatusRequest ConvertToDynamicsRequest(this ValidateVendorDto dto)
    {
        return new Vsd_CheckVendorStatusRequest
        {
            VendorNumber = dto.VendorNumber ?? string.Empty,
            VendorPostalCode = dto.VendorPostalCode ?? string.Empty,
        };
    }

    public static Vsd_CheckVendorStatusRequest ConvertToDynamicsRequest(this ValidateVendorAndCounsellorDto dto)
    {
        return new Vsd_CheckVendorStatusRequest
        {
            VendorNumber = dto.VendorNumber ?? string.Empty,
            VendorPostalCode = dto.VendorPostalCode ?? string.Empty,
            CounselorNumber = dto.CounsellorNumber ?? string.Empty,
            CounselorLastName = dto.CounsellorLastName ?? string.Empty,
        };
    }
}
