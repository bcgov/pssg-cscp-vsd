using Gov.Cscp.VictimServices.Public.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using Newtonsoft.Json;
using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Gov.Cscp.VictimServices.Public.Models.Extensions;

namespace Gov.Cscp.VictimServices.Public.Controllers
{
    [Route("api/[controller]")]
    public partial class JusticeController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public JusticeController(IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpPost("saveapplication")]
        public async Task<IActionResult> SaveApplication([FromBody] ApplicationFormModel model)
        {
            if (model == null)
            {
                if (ModelState.ErrorCount > 0)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors.Select(b => b.ErrorMessage));
                    return new JsonResult(new { IsSuccess = false, Status = "Application Save Error", Message = "Errors in binding: " + string.Join(Environment.NewLine, errors) });
                }
                else
                {
                    return new JsonResult(new { IsSuccess = false, Status = "Application Save Error", Message = "Error: Model is null." });
                }
            }

            var t = Task.Run(() => CreateCaseActionOld(_configuration, model));
            t.Wait();

            var dynamicsResponse = JsonConvert.DeserializeObject<DynamicsResponse>(t.Result);
            var result = new { IsSuccess = dynamicsResponse.IsSuccess, Status = "Application Save", Message = dynamicsResponse.Result };
            return new JsonResult(result);
        }
        
        [HttpPost("submitcounsellorinvoice")]
        public async Task<IActionResult> SubmitCounsellorInvoice([FromBody] CounsellorInvoiceFormModel model)
        {
            if (model == null)
            {
                if (ModelState.ErrorCount > 0)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors.Select(b => b.ErrorMessage));
                    return new JsonResult(new { IsSuccess = false, Status = "Invoice Save Error", Message = "Errors in binding: " + string.Join(Environment.NewLine, errors) });
                }
                else
                {
                    return new JsonResult(new { IsSuccess = false, Status = "Invoice Save Error", Message = "Error: Model is null." });
                }
            }

            var t = Task.Run(() => CreateInvoiceAction(_configuration, model));
            t.Wait();

            var dynamicsResponse = JsonConvert.DeserializeObject<DynamicsResponse>(t.Result);
            var result = new { IsSuccess = dynamicsResponse.IsSuccess, Status = "Invoice Save", Message = dynamicsResponse.Result };
            return new JsonResult(result);
        }

        [HttpGet("getdata")]
        public ActionResult Sample()
        {
            // TODO: GetDefaults probably shouldn't be in the extensions class, but I'm not sure where else to put it since the
            // extensions also need it
            var application = ApplicationModelExtensions.GetApplicationDefaults();
            var applicationJson = JsonConvert.SerializeObject(application);

            return new JsonResult(applicationJson);
        }

        [HttpGet("dynamicstest")]
        public ActionResult TestDynamics()
        {
            var model = new ApplicationFormModel();
            var t = Task.Run(() => CreateCaseAction(_configuration, model));
            t.Wait();

            return new JsonResult(t.Result);
        }

        private static async Task<string> CreateCaseAction(IConfiguration configuration, ApplicationFormModel model)
        {
            HttpClient httpClient = null;
            try
            {
                var endpointAction = "vsd_CreateCVAPClaim";
                httpClient = GetDynamicsHttpClient(configuration, endpointAction);

                var application = model.ToVsdVictimsModel();
                var applicationJson = JsonConvert.SerializeObject(application);

                HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, endpointAction);
                request.Content = new StringContent(applicationJson, Encoding.UTF8, "application/json");

                HttpResponseMessage response = await httpClient.SendAsync(request);

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    var jsonResult = response.Content.ReadAsStringAsync().Result;
                    return jsonResult;
                }

                return response.Content.ReadAsStringAsync().Result;
            }
            finally
            {
                if (httpClient != null)
                    httpClient.Dispose();
            }
        }
        
        private static async Task<string> CreateInvoiceAction(IConfiguration configuration, CounsellorInvoiceFormModel model)
        {
            HttpClient httpClient = null;
            try
            {
                var endpointAction = "vsd_SubmitCounselorInvoice";
                httpClient = GetDynamicsHttpClient(configuration, endpointAction);

                var invoiceModel = model.ToDynamicsModel();
                var invoiceJson = JsonConvert.SerializeObject(invoiceModel);

                HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, endpointAction);
                request.Content = new StringContent(invoiceJson, Encoding.UTF8, "application/json");

                HttpResponseMessage response = await httpClient.SendAsync(request);

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    var jsonResult = response.Content.ReadAsStringAsync().Result;
                    return jsonResult;
                }

                return response.Content.ReadAsStringAsync().Result;
            }
            finally
            {
                if (httpClient != null)
                    httpClient.Dispose();
            }
        }

        private static HttpClient GetDynamicsHttpClient(IConfiguration configuration, string endpointAction)
        {
            HttpClient httpClient;
            var dynamicsOdataUri = configuration["DYNAMICS_ODATAURI"];
            var ssgUsername = configuration["SSG_USERNAME"];
            var ssgPassword = configuration["SSG_PASSWORD"];

//            httpClient = new HttpClient(new HttpClientHandler { Credentials = new NetworkCredential(ssgUsername, ssgPassword) });
            httpClient = new HttpClient(new HttpClientHandler { });
            httpClient.BaseAddress = new Uri(string.Join("/", dynamicsOdataUri, endpointAction));
            httpClient.Timeout = new TimeSpan(1, 0, 0);  // 1 hour timeout  
            httpClient.DefaultRequestHeaders.Add("OData-MaxVersion", "4.0");
            httpClient.DefaultRequestHeaders.Add("OData-Version", "4.0");
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            return httpClient;
        }

        private static async Task<string> CreateCaseActionOld(IConfiguration configuration, ApplicationFormModel model)
        {
            HttpClient httpClient = null;
            try
            {
                string dynamicsOdataUri = configuration["DYNAMICS_ODATAURI"];
                string aadTenantId = configuration["DYNAMICS_AADTENTANTID"];
                string serverAppIdUri = configuration["DYNAMICS_SERVERAPPIDURI"];
                string clientKey = configuration["DYNAMICS_CLIENTKEY"];
                string clientId = configuration["DYNAMICS_CLIENTID"];

                string ssgUsername = "";
                string ssgPassword = "";

                AuthenticationResult authenticationResult = null;

                // authenticate using ADFS.
                if (string.IsNullOrEmpty(ssgUsername) || string.IsNullOrEmpty(ssgPassword))
                {
                    var authenticationContext = new AuthenticationContext($"https://login.windows.net/{aadTenantId}");
                    var clientCredential = new ClientCredential(clientId, clientKey);
                    var task = authenticationContext.AcquireTokenAsync(serverAppIdUri, clientCredential);

                    task.Wait();
                    authenticationResult = task.Result;
                }

                var application = model.ToVsdVictimsModel();
                var applicationJson = JsonConvert.SerializeObject(application);

                httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", authenticationResult.AccessToken);
                httpClient.BaseAddress = new Uri(string.Join("/", dynamicsOdataUri, "vsd_CreateCVAPClaim"));
                httpClient.Timeout = new TimeSpan(1, 0, 0);  // 1 hour timeout  
                httpClient.DefaultRequestHeaders.Add("OData-MaxVersion", "4.0");
                httpClient.DefaultRequestHeaders.Add("OData-Version", "4.0");
                httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "vsd_CreateCVAPClaim");
                request.Content = new StringContent(applicationJson, Encoding.UTF8, "application/json");

                HttpResponseMessage response = await httpClient.SendAsync(request);

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    var jsonResult = response.Content.ReadAsStringAsync().Result;
                    return jsonResult;
                }

                return response.Content.ReadAsStringAsync().Result;
                //return response;
            }
            finally
            {
                if (httpClient != null)
                    httpClient.Dispose();
            }
        }


        // Sample error result
        // "message": "{\"@odata.context\":\"https://victimservicesdev.api.crm3.dynamics.com/api/data/v9.1/$metadata#Microsoft.Dynamics.CRM.vsd_CreateCVAPClaimResponse\",\"IsSuccess\":false,\"Result\":\"Error: Applicant's First Name is required..\"}"
        internal class DynamicsResponse
        {
            public string odatacontext { get; set; }
            public bool IsSuccess { get; set; }
            public string Result { get; set; }
        }
    }
}
