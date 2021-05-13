using Gov.Cscp.VictimServices.Public.JsonObjects;
using Gov.Cscp.VictimServices.Public.Models.Extensions;
using Gov.Cscp.VictimServices.Public.Models;
using Gov.Cscp.VictimServices.Public.Services;
using Gov.Cscp.VictimServices.Public.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Serilog;
using System.Threading.Tasks;
using System;

namespace Gov.Cscp.VictimServices.Public.Controllers
{
    [Route("api/[controller]")]
    public partial class JusticeController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly IDynamicsResultService _dynamicsResultService;
        private readonly IRestitutionResultService _restitutionResultService;
        private readonly ILogger _logger;

        public JusticeController(IConfiguration configuration, IDynamicsResultService dynamicsResultService, IRestitutionResultService restitutionResultService)
        {
            _configuration = configuration;
            this._dynamicsResultService = dynamicsResultService;
            this._restitutionResultService = restitutionResultService;
            _logger = Log.Logger;
        }

        [HttpPost("saveapplication")]
        public async Task<IActionResult> SaveApplication([FromBody] ApplicationFormModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.Error($"API call to 'SaveApplication' made with invalid model state. Error is:\n{ModelState}. Source = VSD");
                    return BadRequest(ModelState);
                }

                string endpointAction = "vsd_CreateCVAPClaim";
                ApplicationDynamicsModel application = model.ToVsdVictimsModel();
                JsonSerializerSettings settings = new JsonSerializerSettings();
                settings.NullValueHandling = NullValueHandling.Ignore;
                string applicationJson = JsonConvert.SerializeObject(application, settings);
                applicationJson = applicationJson.Replace("odatatype", "@odata.type");

                Console.WriteLine("Application JSON:");
                Console.WriteLine(applicationJson);

                DynamicsResult result = await _dynamicsResultService.Post(endpointAction, applicationJson);
                return StatusCode((int)result.statusCode, result.result.ToString());
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while saving application. Source = VSD", model);
                return BadRequest();
            }
            finally { }
        }

        [HttpPost("submitcounsellorinvoice")]
        public async Task<IActionResult> SubmitCounsellorInvoice([FromBody] CounsellorInvoiceFormModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.Error($"API call to 'SubmitCounsellorInvoice' made with invalid model state. Error is:\n{ModelState}. Source = VSD");
                    return BadRequest(ModelState);
                }

                string endpointAction = "vsd_SubmitCounselorInvoice";
                CounsellorInvoiceDynamicsModel invoiceModel = model.ToDynamicsModel();
                JsonSerializerSettings settings = new JsonSerializerSettings();
                settings.NullValueHandling = NullValueHandling.Ignore;
                string invoiceJson = JsonConvert.SerializeObject(invoiceModel, settings);
                invoiceJson = invoiceJson.Replace("odatatype", "@odata.type");

                Console.WriteLine("Invoice JSON:");
                Console.WriteLine(invoiceJson);

                DynamicsResult result = await _dynamicsResultService.Post(endpointAction, invoiceJson);
                return StatusCode((int)result.statusCode, result.result.ToString());
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while submitting counsellor invoice. Source = VSD", model);
                return BadRequest();
            }
            finally { }
        }

        [HttpPost("submitrestitution")]
        public async Task<IActionResult> SubmitRestitution([FromBody] RestitutionFormModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.Error($"API call to 'SubmitRestitution' made with invalid model state. Error is:\n{ModelState}. Source = VSD");
                    return BadRequest(ModelState);
                }

                var endpointAction = "vsd_CreateRestitutionCase";
                JsonSerializerSettings settings = new JsonSerializerSettings();
                settings.NullValueHandling = NullValueHandling.Ignore;
                var modelString = JsonConvert.SerializeObject(model, settings);

                DynamicsResult result = await _restitutionResultService.Post(endpointAction, modelString);
                return StatusCode((int)result.statusCode, result.result.ToString());
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while saving victim restitution. Source = VSD", model);
                return BadRequest();
            }
            finally { }
        }

        [HttpGet("validate_vendor/{VendorNumber}/{VendorPostalCode}")]
        public async Task<IActionResult> ValidateVendor(String VendorNumber, String VendorPostalCode)
        {
            try
            {
                string requestJson = "{\"VendorNumber\":\"" + VendorNumber + "\",\"VendorPostalCode\":\"" + VendorPostalCode + "\"}";
                string endpointUrl = "vsd_CheckVendorStatus";

                DynamicsResult result = await _dynamicsResultService.Post(endpointUrl, requestJson);

                return StatusCode((int)result.statusCode, result.result.ToString());
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while validating vendor. Source = VSD", VendorNumber, VendorPostalCode);
                return BadRequest();
            }
            finally { }
        }

        [HttpGet("validate_vendor_and_counsellor/{VendorNumber}/{VendorPostalCode}/{CounsellorNumber}/{CounsellorLastName}")]
        public async Task<IActionResult> ValidateVendorAndCounsellor(String VendorNumber, String VendorPostalCode, String CounsellorNumber, String CounsellorLastName)
        {
            try
            {
                string requestJson = "{\"VendorNumber\":\"" + VendorNumber + "\",\"VendorPostalCode\":\"" + VendorPostalCode + "\",\"CounselorNumber\":\"" + CounsellorNumber + "\",\"CounselorLastName\":\"" + CounsellorLastName + "\"}";
                string endpointUrl = "vsd_CheckVendorStatus";

                DynamicsResult result = await _dynamicsResultService.Post(endpointUrl, requestJson);

                return StatusCode((int)result.statusCode, result.result.ToString());
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while validating vendor and counsellor. Source = VSD");
                return BadRequest();
            }
            finally { }
        }
    }
}
