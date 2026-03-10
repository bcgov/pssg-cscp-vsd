using System;
using System.Threading.Tasks;
using Database.Model;
using Gov.Cscp.VictimServices.Public.Models;
using Gov.Cscp.VictimServices.Public.Models.Extensions;
using Gov.Cscp.VictimServices.Public.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.PowerPlatform.Dataverse.Client;
using Serilog;

namespace Gov.Cscp.VictimServices.Public.Controllers
{
    [Route("api/[controller]")]
    public partial class JusticeController : Controller
    {
        private readonly IOrganizationServiceAsync _organizationService;
        private readonly ILogger _logger;

        public JusticeController(IOrganizationServiceAsync organizationService)
        {
            _organizationService = organizationService;
            _logger = Log.Logger;
        }

        [HttpPost("saveapplication")]
        public async Task<IActionResult> SaveApplication([FromBody] ApplicationFormModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.Error("API call to 'SaveApplication' made with invalid model state. Source = VSD");
                    return BadRequest(ModelState);
                }

                var claimRequest = model.ConvertToDynamicsRequest();

                _logger.Information("Executing vsd_CreateCVAPClaim action.");
                var response = await _organizationService.ExecuteAsync(claimRequest) as Vsd_CreateCvapClaimResponse;

                if (response?.IsSuccess == true)
                {
                    _logger.Information("Successfully submitted CVAP claim application.");
                    return Ok(new { success = true, result = response.Result });
                }
                else
                {
                    _logger.Warning("Failed to submit CVAP claim application.");
                    return StatusCode(500, new { success = false, result = response?.Result ?? "Unknown error" });
                }
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while saving application. Source = VSD");
                return StatusCode(500, new { success = false, error = e.Message });
            }
        }

        [HttpGet("validate_vendor/{VendorNumber}/{VendorPostalCode}")]
        public async Task<IActionResult> ValidateVendor(string VendorNumber, string VendorPostalCode)
        {
            try
            {
                var dto = new ValidateVendorDto { VendorNumber = VendorNumber, VendorPostalCode = VendorPostalCode };

                var vendorRequest = dto.ConvertToDynamicsRequest();

                _logger.Information("Executing vsd_CheckVendorStatus action.");
                var response = await _organizationService.ExecuteAsync(vendorRequest) as Vsd_CheckVendorStatusResponse;

                if (response?.IsSuccess == true)
                {
                    _logger.Information("Successfully validated vendor.");
                    return Ok(new { success = true, counsellorLevel = response.CounsellorLevel });
                }
                else
                {
                    _logger.Warning("Vendor validation failed for vendor.");
                    return StatusCode(500, new { success = false, counsellorLevel = 0 });
                }
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while validating vendor. Source = VSD");
                return StatusCode(500, new { success = false, error = e.Message });
            }
        }

        [HttpGet(
            "validate_vendor_and_counsellor/{VendorNumber}/{VendorPostalCode}/{CounsellorNumber}/{CounsellorLastName}"
        )]
        public async Task<IActionResult> ValidateVendorAndCounsellor(
            string VendorNumber,
            string VendorPostalCode,
            string CounsellorNumber,
            string CounsellorLastName
        )
        {
            try
            {
                var dto = new ValidateVendorAndCounsellorDto
                {
                    VendorNumber = VendorNumber,
                    VendorPostalCode = VendorPostalCode,
                    CounsellorNumber = CounsellorNumber,
                    CounsellorLastName = CounsellorLastName,
                };

                var vendorRequest = dto.ConvertToDynamicsRequest();

                _logger.Information("Executing vsd_CheckVendorStatus action with counsellor.");
                var response = await _organizationService.ExecuteAsync(vendorRequest) as Vsd_CheckVendorStatusResponse;

                if (response?.IsSuccess == true)
                {
                    _logger.Information("Successfully validated vendor and counsellor.");
                    return Ok(new { success = true, counsellorLevel = response.CounsellorLevel });
                }
                else
                {
                    _logger.Warning("Vendor and counsellor validation failed.");
                    return Ok(new { success = false, counsellorLevel = 0 });
                }
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while validating vendor and counsellor. Source = VSD");
                return StatusCode(500, new { success = false, error = e.Message });
            }
        }
    }
}
