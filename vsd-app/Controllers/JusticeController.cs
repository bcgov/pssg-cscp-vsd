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
using System.Collections.Generic;

namespace Gov.Cscp.VictimServices.Public.Controllers
{
    [Route("api/[controller]")]
    public partial class JusticeController : Controller
    {

        #region Credentials
        private static string idirName = "";
        private static string password = "";
        private static string resource = "";
        private static string clientId = "";
        private static string secret = "";
        #endregion

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

            var t = Task.Run(() => CreateCaseAction(_configuration, model));
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

        [HttpPost("submitvictimrestitution")]
        public async Task<IActionResult> SubmitVictimRestitution([FromBody] VictimRestitutionFormModel model)
        {
            if (model == null)
            {
                if (ModelState.ErrorCount > 0)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors.Select(b => b.ErrorMessage));
                    return new JsonResult(new { IsSuccess = false, Status = "Restitution Save Error", Message = "Errors in binding: " + string.Join(Environment.NewLine, errors) });
                }
                else
                {
                    return new JsonResult(new { IsSuccess = false, Status = "Restitution Save Error", Message = "Error: Model is null." });
                }
            }

            var t = Task.Run(() => CreateVictimRestitutionAction(_configuration, model));
            t.Wait();

            var dynamicsResponse = JsonConvert.DeserializeObject<DynamicsResponse>(t.Result);
            var result = new { IsSuccess = dynamicsResponse.IsSuccess, Status = "Restitution Save", Message = dynamicsResponse.Result };
            return new JsonResult(result);
        }

        [HttpPost("submitoffenderrestitution")]
        public async Task<IActionResult> SubmitOffenderRestitution([FromBody] OffenderRestitutionFormModel model)
        {
            if (model == null)
            {
                if (ModelState.ErrorCount > 0)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors.Select(b => b.ErrorMessage));
                    return new JsonResult(new { IsSuccess = false, Status = "Restitution Save Error", Message = "Errors in binding: " + string.Join(Environment.NewLine, errors) });
                }
                else
                {
                    return new JsonResult(new { IsSuccess = false, Status = "Restitution Save Error", Message = "Error: Model is null." });
                }
            }

            var t = Task.Run(() => CreateOffenderRestitutionAction(_configuration, model));
            t.Wait();

            var dynamicsResponse = JsonConvert.DeserializeObject<DynamicsResponse>(t.Result);
            var result = new { IsSuccess = dynamicsResponse.IsSuccess, Status = "Restitution Save", Message = dynamicsResponse.Result };
            return new JsonResult(result);
        }

        private static async Task<string> CreateCaseAction(IConfiguration configuration, ApplicationFormModel model)
        {
            HttpClient httpClient = null;
            try
            {
                var endpointAction = "vsd_CreateCVAPClaim";
                //httpClient = GetDynamicsHttpClient(configuration, endpointAction);
                await GetDynamicsHttpClientNew(configuration);

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
                //httpClient = GetDynamicsHttpClient(configuration, endpointAction);
                await GetDynamicsHttpClientNew(configuration);

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

        private static async Task<string> CreateVictimRestitutionAction(IConfiguration configuration, VictimRestitutionFormModel model)
        {
            HttpClient httpClient = null;
            try
            {
                var endpointAction = "vsd_RESTITUTIONMAPPINGNEEDED";
                //httpClient = GetDynamicsHttpClient(configuration, endpointAction);
                await GetDynamicsHttpClientNew(configuration);
                
                // THIS SHOULD BECOME A DYNAMICS MODEL
                var dynamicsModel = model; // model.ToDynamicsModel();
                var invoiceJson = JsonConvert.SerializeObject(dynamicsModel);

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

        private static async Task<string> CreateOffenderRestitutionAction(IConfiguration configuration, OffenderRestitutionFormModel model)
        {
            HttpClient httpClient = null;
            try
            {
                var endpointAction = "vsd_RESTITUTIONMAPPINGNEEDED";
                //httpClient = GetDynamicsHttpClient(configuration, endpointAction);
                await GetDynamicsHttpClientNew(configuration);

                // THIS SHOULD BECOME A DYNAMICS MODEL
                var dynamicsModel = model; // model.ToDynamicsModel();
                var invoiceJson = JsonConvert.SerializeObject(dynamicsModel);

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

        static async Task GetDynamicsHttpClientNew(IConfiguration configuration)
        {
            var client = new HttpClient();

            var dynamicsOdataUri = configuration["DYNAMICS_ODATAURI"];
            var ssgUsername = configuration["SSG_USERNAME"];
            var ssgPassword = configuration["SSG_PASSWORD"];
            var dynamicsID = configuration["DYN_ID"];
            var dynamicsSecret = configuration["DYN_SECRET"];

            client.DefaultRequestHeaders.Add("x-client-SKU", "PCL.CoreCLR");
            client.DefaultRequestHeaders.Add("x-client-Ver", "5.1.0.0");
            client.DefaultRequestHeaders.Add("x-ms-PKeyAuth", "1.0");
            client.DefaultRequestHeaders.Add("client-request-id", Guid.NewGuid().ToString());
            client.DefaultRequestHeaders.Add("return-client-request-id", "true");
            client.DefaultRequestHeaders.Add("Accept", "application/json");

            var stsEndpoint = "https://sts4.gov.bc.ca/adfs/oauth2/token";

            var pairs = new List<KeyValuePair<string, string>>

            {
                //new KeyValuePair<string, string>("resource", resource),
                new KeyValuePair<string, string>("resource", dynamicsOdataUri),//resource),
                new KeyValuePair<string, string>("client_id", dynamicsID),//clientId),
                //new KeyValuePair<string, string>("client_id", clientId),
                //new KeyValuePair<string, string>("client_secret", secret),
                new KeyValuePair<string, string>("client_secret", dynamicsSecret),//secret),
                new KeyValuePair<string, string>("client_info", "1"),
                new KeyValuePair<string, string>("username", ssgUsername),// idirName),
                //new KeyValuePair<string, string>("username", idirName),
                //new KeyValuePair<string, string>("password", password),
                new KeyValuePair<string, string>("password", ssgPassword),// password),
                new KeyValuePair<string, string>("scope", "openid"),
                new KeyValuePair<string, string>("response_mode", "form_post"),
                new KeyValuePair<string, string>("grant_type", "password")
             };

            var content = new FormUrlEncodedContent(pairs);

            var _httpResponse = await client.PostAsync(stsEndpoint, content);

            var _responseContent = await _httpResponse.Content.ReadAsStringAsync();

            Dictionary<string, string> result = JsonConvert.DeserializeObject<Dictionary<string, string>>(_responseContent);
            string token = result["access_token"];

            client = new HttpClient();
            var Authorization = $"Bearer {token}";
            client.DefaultRequestHeaders.Add("Authorization", Authorization);
            client.DefaultRequestHeaders.Add("Cache-Control", "no-cache");
            client.DefaultRequestHeaders.Add("OData-Version", "4.0");
            client.DefaultRequestHeaders.Add("Accept", "application/json");

            string url = "https://spd-spice.dev.jag.gov.bc.ca/api/data/v9.0/accounts";

            HttpRequestMessage _httpRequest = new HttpRequestMessage(HttpMethod.Get, url);

            var _httpResponse2 = await client.SendAsync(_httpRequest);
            HttpStatusCode _statusCode = _httpResponse2.StatusCode;

            var _responseString = _httpResponse2.ToString();
            var _responseContent2 = await _httpResponse2.Content.ReadAsStringAsync();

            Console.Out.WriteLine(_responseContent2);
        }


        private static HttpClient GetDynamicsHttpClient(IConfiguration configuration, string endpointAction)
        {
            // OLD CODE
            HttpClient httpClient;
            var dynamicsOdataUri = configuration["DYNAMICS_ODATAURI"];
            var ssgUsername = configuration["SSG_USERNAME"];
            var ssgPassword = configuration["SSG_PASSWORD"];

            httpClient = new HttpClient(new HttpClientHandler { Credentials = new NetworkCredential(ssgUsername, ssgPassword) });
            //httpClient = new HttpClient(new HttpClientHandler { });
            httpClient.BaseAddress = new Uri(string.Join("/", dynamicsOdataUri, endpointAction));
            httpClient.Timeout = new TimeSpan(1, 0, 0);  // 1 hour timeout  
            httpClient.DefaultRequestHeaders.Add("OData-MaxVersion", "4.0");
            httpClient.DefaultRequestHeaders.Add("OData-Version", "4.0");
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            return httpClient;
            // END OLD CODE
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
