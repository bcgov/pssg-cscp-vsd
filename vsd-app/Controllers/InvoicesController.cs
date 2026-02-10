using System;
using System.Linq;
using System.Threading.Tasks;
using Database.Model;
using Gov.Cscp.VictimServices.Public.Models;
using Gov.Cscp.VictimServices.Public.Models.Extensions;
using Gov.Cscp.VictimServices.Public.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Serilog;

namespace Gov.Cscp.VictimServices.Public.Controllers
{
    [Route("api/[controller]")]
    public class InvoicesController : Controller
    {
        private readonly IOrganizationServiceAsync _organizationService;
        private readonly ILogger _logger;

        public InvoicesController(IOrganizationServiceAsync organizationService)
        {
            _organizationService = organizationService;
            _logger = Log.Logger;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] InvoiceDto model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.Error($"API call to 'SubmitCounsellorInvoice' made with invalid model state. Source = VSD");
                    return BadRequest(ModelState);
                }

                var invoiceRequest = model.ConvertToDynamicsRequest();

                _logger.Information("Executing vsd_SubmitCounselorInvoice action.");
                var response =
                    await _organizationService.ExecuteAsync(invoiceRequest) as Vsd_SubmitCounselorInvoiceResponse;

                if (response?.IsSuccess == true)
                {
                    _logger.Information("Successfully submitted counsellor invoice.");
                    return Ok(new { success = true, result = response.Result });
                }
                else
                {
                    _logger.Warning("Failed to submit counsellor invoice.");
                    return BadRequest(new { success = false, result = response?.Result ?? "Unknown error" });
                }
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while submitting counsellor invoice. Source = VSD.");
                return StatusCode(500, new { success = false, error = e.Message });
            }
        }
    }
}
