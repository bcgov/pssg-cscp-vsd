using Gov.Cscp.VictimServices.Public.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Threading.Tasks;
using Gov.Cscp.VictimServices.Public.Models.Extensions;
using Gov.Cscp.VictimServices.Public.JsonObjects;
using Gov.Cscp.VictimServices.Public.Models;
using Gov.Cscp.VictimServices.Public.Services;

namespace Gov.Cscp.VictimServices.Public.Controllers
{
    [Route("api/[controller]")]
    public partial class JusticeController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly IDynamicsResultService _dynamicsResultService;

        public JusticeController(IConfiguration configuration, IDynamicsResultService dynamicsResultService)
        {
            _configuration = configuration;
            this._dynamicsResultService = dynamicsResultService;
        }

        [HttpPost("saveapplication")]
        public async Task<IActionResult> SaveApplication([FromBody] ApplicationFormModel model)
        {
            if (model == null)
            {
                return StatusCode(502);
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

        [HttpPost("submitcounsellorinvoice")]
        public async Task<IActionResult> SubmitCounsellorInvoice([FromBody] CounsellorInvoiceFormModel model)
        {
            if (model == null)
            {
                return StatusCode(502);
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

        [HttpPost("submitvictimrestitution")]
        public async Task<IActionResult> SubmitVictimRestitution([FromBody] VictimRestitutionFormModel model)
        {
            if (model == null)
            {
                return StatusCode(502);
            }

            var endpointAction = "vsd_CreateRestitutionCase";
            var dynamicsModel = model.ToVictimRestitutionModel(); // model.ToDynamicsModel();
            JsonSerializerSettings settings = new JsonSerializerSettings();
            settings.NullValueHandling = NullValueHandling.Ignore;
            var invoiceJson = JsonConvert.SerializeObject(dynamicsModel, settings);
            invoiceJson = invoiceJson.Replace("odatatype", "@odata.type");

            Console.WriteLine("Invoice JSON:");
            Console.WriteLine(invoiceJson);

            DynamicsResult result = await _dynamicsResultService.Post(endpointAction, invoiceJson);
            return StatusCode((int)result.statusCode, result.result.ToString());
        }

        [HttpPost("submitoffenderrestitution")]
        public async Task<IActionResult> SubmitOffenderRestitution([FromBody] OffenderRestitutionFormModel model)
        {
            if (model == null)
            {
                return StatusCode(502);
            }

            var offenderRestitution = model.ToOffenderRestitutionModel();
            JsonSerializerSettings settings = new JsonSerializerSettings();
            settings.NullValueHandling = NullValueHandling.Ignore;
            var offenderRestitutionJson = JsonConvert.SerializeObject(offenderRestitution, settings);
            offenderRestitutionJson = offenderRestitutionJson.Replace("odatatype", "@odata.type");

            var endpointAction = "vsd_CreateRestitutionCase";

            Console.WriteLine("Invoice JSON:");
            Console.WriteLine(offenderRestitutionJson);

            DynamicsResult result = await _dynamicsResultService.Post(endpointAction, offenderRestitutionJson);
            return StatusCode((int)result.statusCode, result.result.ToString());
        }

        [HttpGet("validate_vendor/{VendorNumber}/{VendorPostalCode}")]
        public async Task<IActionResult> ValidateVendor(String VendorNumber, String VendorPostalCode)
        {
            string requestJson = "{\"VendorNumber\":\"" + VendorNumber + "\",\"VendorPostalCode\":\"" + VendorPostalCode + "\"}";
            string endpointUrl = "vsd_CheckVendorStatus";

            DynamicsResult result = await _dynamicsResultService.Post(endpointUrl, requestJson);

            return StatusCode((int)result.statusCode, result.result.ToString());
        }

        [HttpGet("validate_vendor_and_counsellor/{VendorNumber}/{VendorPostalCode}/{CounsellorNumber}/{CounsellorLastName}")]
        public async Task<IActionResult> ValidateVendorAndCounsellor(String VendorNumber, String VendorPostalCode, String CounsellorNumber, String CounsellorLastName)
        {
            string requestJson = "{\"VendorNumber\":\"" + VendorNumber + "\",\"VendorPostalCode\":\"" + VendorPostalCode + "\",\"CounselorNumber\":\"" + CounsellorNumber + "\",\"CounselorLastName\":\"" + CounsellorLastName + "\"}";
            string endpointUrl = "vsd_CheckVendorStatus";

            DynamicsResult result = await _dynamicsResultService.Post(endpointUrl, requestJson);

            return StatusCode((int)result.statusCode, result.result.ToString());
        }

        // Sample error result
        // "message": "{\"@odata.context\":\"https://victimservicesdev.api.crm3.dynamics.com/api/data/v9.1/$metadata#Microsoft.Dynamics.CRM.vsd_CreateCVAPClaimResponse\",\"IsSuccess\":false,\"Result\":\"Error: Applicant's First Name is required..\"}"
        // internal class DynamicsResponse
        // {
        //     public string odatacontext { get; set; }
        //     public bool IsSuccess { get; set; }
        //     public bool IsCompletedSuccessfully { get; set; }
        //     public string Result { get; set; }
        // }
    }
}
