using Gov.Cscp.VictimServices.Public.ViewModels;
using Newtonsoft.Json.Linq;
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
using Microsoft.Rest;

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

            string tempString = Newtonsoft.Json.JsonConvert.SerializeObject(t);
            var dynamicsResponse = JsonConvert.DeserializeObject<DynamicsResponse>(tempString);
            var result = new { IsSuccess = dynamicsResponse.IsCompletedSuccessfully, Status = "Application Save", Message = dynamicsResponse.Result };
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

            string tempString = Newtonsoft.Json.JsonConvert.SerializeObject(t);
            var dynamicsResponse = JsonConvert.DeserializeObject<DynamicsResponse>(tempString);
            var result = new { IsSuccess = dynamicsResponse.IsCompletedSuccessfully, Status = "Invoice Save", Message = dynamicsResponse.Result };
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

            string tempString = Newtonsoft.Json.JsonConvert.SerializeObject(t);
            var dynamicsResponse = JsonConvert.DeserializeObject<DynamicsResponse>(tempString);
            var result = new { IsSuccess = dynamicsResponse.IsCompletedSuccessfully, Status = "Restitution Save", Message = dynamicsResponse.Result };
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
                var application = model.ToVsdVictimsModel();
                JsonSerializerSettings settings = new JsonSerializerSettings();
                settings.NullValueHandling = NullValueHandling.Ignore;
                var applicationJson = JsonConvert.SerializeObject(application, settings);
                applicationJson = applicationJson.Replace("odatatype", "@odata.type");

                var endpointAction = "vsd_CreateCVAPClaim";
                //httpClient = GetDynamicsHttpClient(configuration, endpointAction);
                var tuple = await GetDynamicsHttpClientNew(configuration, applicationJson, endpointAction);

                //HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, endpointAction);
                //request.Content = new StringContent(applicationJson, Encoding.UTF8, "application/json");

                //HttpResponseMessage response = await httpClient.SendAsync(request);

                //if (response.StatusCode == HttpStatusCode.OK)
                //{
                //    var jsonResult = response.Content.ReadAsStringAsync().Result;
                //    return jsonResult;
                //}

                //return response.Content.ReadAsStringAsync().Result;
                string tempResult = tuple.Item1.ToString();

                DynamicsResponse dynamicsResponse = new DynamicsResponse();
                dynamicsResponse.IsSuccess = true;
                dynamicsResponse.Result = tempResult;
                dynamicsResponse.odatacontext = tuple.Item2.ToString();

                return dynamicsResponse.Result;

            }
            finally
            {
                if (httpClient != null)
                    httpClient.Dispose();
            }
        }
        
        private static async Task<String> CreateInvoiceAction(IConfiguration configuration, CounsellorInvoiceFormModel model)
        {
            HttpClient httpClient = null;
            try
            {
                var invoiceModel = model.ToDynamicsModel();
                JsonSerializerSettings settings = new JsonSerializerSettings();
                settings.NullValueHandling = NullValueHandling.Ignore;
                var invoiceJson = JsonConvert.SerializeObject(invoiceModel, settings);
                invoiceJson = invoiceJson.Replace("odatatype", "@odata.type");

                var endpointAction = "vsd_SubmitCounselorInvoice";
                var tuple = await GetDynamicsHttpClientNew(configuration, invoiceJson, endpointAction);

                //HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, endpointAction);
                //request.Content = new StringContent(invoiceJson, Encoding.UTF8, "application/json");

                //HttpResponseMessage response = await httpClient.SendAsync(request);

                //if (response.StatusCode == HttpStatusCode.OK)
                //{
                //    var jsonResult = response.Content.ReadAsStringAsync().Result;
                //    return jsonResult;
                //}

                //return response.Content.ReadAsStringAsync().Result;

                string tempResult = tuple.Item1.ToString();

                DynamicsResponse dynamicsResponse = new DynamicsResponse();
                dynamicsResponse.IsSuccess = true;
                dynamicsResponse.Result = tempResult;
                dynamicsResponse.odatacontext = tuple.Item2.ToString();

                return dynamicsResponse.Result;
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
                // THIS SHOULD BECOME A DYNAMICS MODEL
                var dynamicsModel = model.ToVictimRestitutionModel(); // model.ToDynamicsModel();
                JsonSerializerSettings settings = new JsonSerializerSettings();
                settings.NullValueHandling = NullValueHandling.Ignore;
                var invoiceJson = JsonConvert.SerializeObject(dynamicsModel, settings);
                invoiceJson = invoiceJson.Replace("odatatype", "@odata.type");

                var endpointAction = "vsd_CreateRestitutionCase";
                var tuple = await GetDynamicsHttpClientNew(configuration, invoiceJson, endpointAction);

                ////HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, endpointAction);
                ////request.Content = new StringContent(invoiceJson, Encoding.UTF8, "application/json");

                ////HttpResponseMessage response = await httpClient.SendAsync(request);

                ////if (response.StatusCode == HttpStatusCode.OK)
                //if (tuple.Item1 == (int)HttpStatusCode.OK)
                //{
                //    var jsonResult = tuple.Item2.Content.ReadAsStringAsync().Result;// response.Content.ReadAsStringAsync().Result;
                //    return jsonResult;
                //}

                //return tuple.Item2.Content.ReadAsStringAsync().Result;// response.Content.ReadAsStringAsync().Result;
                string tempResult = tuple.Item1.ToString();

                DynamicsResponse dynamicsResponse = new DynamicsResponse();
                dynamicsResponse.IsSuccess = (tempResult == "200");// true;
                dynamicsResponse.Result = tempResult;
                dynamicsResponse.odatacontext = tuple.Item2.ToString();

                return dynamicsResponse.Result;

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
                var offenderRestitution = model;
                JsonSerializerSettings settings = new JsonSerializerSettings();
                settings.NullValueHandling = NullValueHandling.Ignore;
                var offenderRestitutionJson = JsonConvert.SerializeObject(offenderRestitution, settings);
                offenderRestitutionJson = offenderRestitutionJson.Replace("odatatype", "@odata.type");

                var endpointAction = "vsd_RESTITUTIONMAPPINGNEEDED";
                //httpClient = GetDynamicsHttpClient(configuration, endpointAction);
                await GetDynamicsHttpClientNew(configuration, offenderRestitutionJson, endpointAction);

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

        static async Task<Tuple<int, HttpResponseMessage>> GetDynamicsHttpClientNew(IConfiguration configuration, String model, String endPointName)
        {

            var builder = new ConfigurationBuilder()
                .AddEnvironmentVariables()
                .AddUserSecrets<Program>(); // must also define a project guid for secrets in the .cspro – add tag <UserSecretsId> containing a guid
            var Configuration = builder.Build();

            string dynamicsOdataUri = Configuration["DYNAMICS_ODATA_URI"]; // Dynamics ODATA endpoint
            string dynamicsJobName = endPointName;// Configuration["DYNAMICS_JOB_NAME"]; // Dynamics Job Name

            if (string.IsNullOrEmpty(dynamicsOdataUri))
            {
                throw new Exception("Configuration setting DYNAMICS_ODATA_URI is blank.");
            }

            // Cloud - x.dynamics.com
            string aadTenantId = Configuration["DYNAMICS_AAD_TENANT_ID"]; // Cloud AAD Tenant ID
            string serverAppIdUri = Configuration["DYNAMICS_SERVER_APP_ID_URI"]; // Cloud Server App ID URI
            string appRegistrationClientKey = Configuration["DYNAMICS_APP_REG_CLIENT_KEY"]; // Cloud App Registration Client Key
            string appRegistrationClientId = Configuration["DYNAMICS_APP_REG_CLIENT_ID"]; // Cloud App Registration Client Id

            // One Premise ADFS (2016)
            string adfsOauth2Uri = Configuration["ADFS_OAUTH2_URI"]; // ADFS OAUTH2 URI - usually /adfs/oauth2/token on STS
            string applicationGroupResource = Configuration["DYNAMICS_APP_GROUP_RESOURCE"]; // ADFS 2016 Application Group resource (URI)
            string applicationGroupClientId = Configuration["DYNAMICS_APP_GROUP_CLIENT_ID"]; // ADFS 2016 Application Group Client ID
            string applicationGroupSecret = Configuration["DYNAMICS_APP_GROUP_SECRET"]; // ADFS 2016 Application Group Secret
            string serviceAccountUsername = Configuration["DYNAMICS_USERNAME"]; // Service account username
            string serviceAccountPassword = Configuration["DYNAMICS_PASSWORD"]; // Service account password

            // API Gateway to NTLM user.  This is used in v8 environments.  Note that the SSG Username and password are not the same as the NTLM user.
            string ssgUsername = Configuration["SSG_USERNAME"];  // BASIC authentication username
            string ssgPassword = Configuration["SSG_PASSWORD"];  // BASIC authentication password

            ServiceClientCredentials serviceClientCredentials = null;
            if (!string.IsNullOrEmpty(appRegistrationClientId) && !string.IsNullOrEmpty(appRegistrationClientKey) && !string.IsNullOrEmpty(serverAppIdUri) && !string.IsNullOrEmpty(aadTenantId))
            // Cloud authentication - using an App Registration's client ID, client key.  Add the App Registration to Dynamics as an Application User.
            {
                var authenticationContext = new AuthenticationContext(
                "https://login.windows.net/" + aadTenantId);
                ClientCredential clientCredential = new ClientCredential(appRegistrationClientId, appRegistrationClientKey);
                var task = authenticationContext.AcquireTokenAsync(serverAppIdUri, clientCredential);
                task.Wait();
                var authenticationResult = task.Result;
                string token = authenticationResult.CreateAuthorizationHeader().Substring("Bearer ".Length);
                serviceClientCredentials = new TokenCredentials(token);
            }
            if (!string.IsNullOrEmpty(adfsOauth2Uri) &&
                        !string.IsNullOrEmpty(applicationGroupResource) &&
                        !string.IsNullOrEmpty(applicationGroupClientId) &&
                        !string.IsNullOrEmpty(applicationGroupSecret) &&
                        !string.IsNullOrEmpty(serviceAccountUsername) &&
                        !string.IsNullOrEmpty(serviceAccountPassword))
            // ADFS 2016 authentication - using an Application Group Client ID and Secret, plus service account credentials.
            {
                // create a new HTTP client that is just used to get a token.
                var stsClient = new HttpClient();

                //stsClient.DefaultRequestHeaders.Add("x-client-SKU", "PCL.CoreCLR");
                //stsClient.DefaultRequestHeaders.Add("x-client-Ver", "5.1.0.0");
                //stsClient.DefaultRequestHeaders.Add("x-ms-PKeyAuth", "1.0");

                stsClient.DefaultRequestHeaders.Add("client-request-id", Guid.NewGuid().ToString());
                stsClient.DefaultRequestHeaders.Add("return-client-request-id", "true");
                stsClient.DefaultRequestHeaders.Add("Accept", "application/json");

                // Construct the body of the request
                var pairs = new List<KeyValuePair<string, string>>
                {
                    new KeyValuePair<string, string>("resource", applicationGroupResource),
                    new KeyValuePair<string, string>("client_id", applicationGroupClientId),
                    new KeyValuePair<string, string>("client_secret", applicationGroupSecret),
                    new KeyValuePair<string, string>("username", serviceAccountUsername),
                    new KeyValuePair<string, string>("password", serviceAccountPassword),
                    new KeyValuePair<string, string>("scope", "openid"),
                    new KeyValuePair<string, string>("response_mode", "form_post"),
                    new KeyValuePair<string, string>("grant_type", "password")
                 };

                // This will also set the content type of the request
                var content = new FormUrlEncodedContent(pairs);
                // send the request to the ADFS server
                var _httpResponse = stsClient.PostAsync(adfsOauth2Uri, content).GetAwaiter().GetResult();
                var _responseContent = _httpResponse.Content.ReadAsStringAsync().GetAwaiter().GetResult();
                // response should be in JSON format.
                try
                {
                    Dictionary<string, string> result = JsonConvert.DeserializeObject<Dictionary<string, string>>(_responseContent);
                    string token = result["access_token"];
                    // set the bearer token.
                    serviceClientCredentials = new TokenCredentials(token);


                    // Code to perform Scheduled task
                    var client = new HttpClient();
                    client.DefaultRequestHeaders.Add("x-client-SKU", "PCL.CoreCLR");
                    client.DefaultRequestHeaders.Add("x-client-Ver", "5.1.0.0");
                    client.DefaultRequestHeaders.Add("x-ms-PKeyAuth", "1.0");
                    client.DefaultRequestHeaders.Add("client-request-id", Guid.NewGuid().ToString());
                    client.DefaultRequestHeaders.Add("return-client-request-id", "true");
                    client.DefaultRequestHeaders.Add("Accept", "application/json");

                    client = new HttpClient();
                    var Authorization = $"Bearer {token}";
                    client.DefaultRequestHeaders.Add("Authorization", Authorization);
                    client.DefaultRequestHeaders.Add("OData-MaxVersion", "4.0");
                    client.DefaultRequestHeaders.Add("OData-Version", "4.0");
                    client.DefaultRequestHeaders.Add("Accept", "application/json");
                    //client.DefaultRequestHeaders.Add("content-type", "application/json");
                    //client.DefaultRequestHeaders.Add("Content-Type", "application/json; charset=utf-8");

                    string url = dynamicsOdataUri + dynamicsJobName;

                    HttpRequestMessage _httpRequest = new HttpRequestMessage(HttpMethod.Post, url);
                    _httpRequest.Content = new StringContent(model, Encoding.UTF8, "application/json");
                    //_httpRequest.Content = new StringContent(System.IO.File.ReadAllText(@"C:\Temp\VSD-RestSampleData3.txt"), Encoding.UTF8, "application/json");
                    

                    //_httpRequest.Content = new StringContent(model);

                    //                    // THIS SHOULD BECOME A DYNAMICS MODEL
                    //                    var dynamicsModel = model; // model.ToDynamicsModel();
                    //                    var invoiceJson = JsonConvert.SerializeObject(dynamicsModel);
                    //
                    //                    _httpRequest.Content = new StringContent(invoiceJson, Encoding.UTF8, "application/json");




                    var _httpResponse2 = await client.SendAsync(_httpRequest);
                    HttpStatusCode _statusCode = _httpResponse2.StatusCode;

                    var _responseString = _httpResponse2.ToString();
                    var _responseContent2 = await _httpResponse2.Content.ReadAsStringAsync();

                    Console.Out.WriteLine(model);
                    Console.Out.WriteLine(_responseString);
                    Console.Out.WriteLine(_responseContent2);

                    return new Tuple<int, HttpResponseMessage>((int)_statusCode, _httpResponse2);
                    // End of scheduled task
                }
                catch (Exception e)
                {
                    return new Tuple<int, HttpResponseMessage>(100, null);
                    throw new Exception(e.Message + " " + _responseContent);
                }

            }
            else if (!string.IsNullOrEmpty(ssgUsername) && !string.IsNullOrEmpty(ssgPassword))
            // Authenticate using BASIC authentication - used for API Gateways with BASIC authentication.  Add the NTLM user associated with the API gateway entry to Dynamics as a user.            
            {
                serviceClientCredentials = new BasicAuthenticationCredentials()
                {
                    UserName = ssgUsername,
                    Password = ssgPassword
                };
            }
            else
            {
                throw new Exception("No configured connection to Dynamics.");
            }

            //IDynamicsClient client = new DynamicsClient(new Uri(dynamicsOdataUri), serviceClientCredentials);

            //// set the native client URI.  This is required if you have a reverse proxy or IFD in place and the native URI is different from your access URI.
            //if (string.IsNullOrEmpty(Configuration["DYNAMICS_NATIVE_ODATA_URI"]))
            //{
            //    client.NativeBaseUri = new Uri(Configuration["DYNAMICS_ODATA_URI"]);
            //}
            //else
            //{
            //    client.NativeBaseUri = new Uri(Configuration["DYNAMICS_NATIVE_ODATA_URI"]);
            //}

            //return client;








            //var client = new HttpClient();

            //var dynamicsOdataUri = configuration["DYNAMICS_ODATAURI"];
            //var ssgUsername = configuration["SSG_USERNAME"];
            //var ssgPassword = configuration["SSG_PASSWORD"];
            //var dynamicsID = configuration["DYN_ID"];
            //var dynamicsSecret = configuration["DYN_SECRET"];

            //client.DefaultRequestHeaders.Add("x-client-SKU", "PCL.CoreCLR");
            //client.DefaultRequestHeaders.Add("x-client-Ver", "5.1.0.0");
            //client.DefaultRequestHeaders.Add("x-ms-PKeyAuth", "1.0");
            //client.DefaultRequestHeaders.Add("client-request-id", Guid.NewGuid().ToString());
            //client.DefaultRequestHeaders.Add("return-client-request-id", "true");
            //client.DefaultRequestHeaders.Add("Accept", "application/json");

            //var stsEndpoint = "https://sts4.gov.bc.ca/adfs/oauth2/token";

            //var pairs = new List<KeyValuePair<string, string>>

            //{
            //    //new KeyValuePair<string, string>("resource", resource),
            //    new KeyValuePair<string, string>("resource", dynamicsOdataUri),//resource),
            //    new KeyValuePair<string, string>("client_id", dynamicsID),//clientId),
            //    //new KeyValuePair<string, string>("client_id", clientId),
            //    //new KeyValuePair<string, string>("client_secret", secret),
            //    new KeyValuePair<string, string>("client_secret", dynamicsSecret),//secret),
            //    new KeyValuePair<string, string>("client_info", "1"),
            //    new KeyValuePair<string, string>("username", ssgUsername),// idirName),
            //    //new KeyValuePair<string, string>("username", idirName),
            //    //new KeyValuePair<string, string>("password", password),
            //    new KeyValuePair<string, string>("password", ssgPassword),// password),
            //    new KeyValuePair<string, string>("scope", "openid"),
            //    new KeyValuePair<string, string>("response_mode", "form_post"),
            //    new KeyValuePair<string, string>("grant_type", "password")
            // };

            //var content = new FormUrlEncodedContent(pairs);

            //var _httpResponse = await client.PostAsync(stsEndpoint, content);

            //var _responseContent = await _httpResponse.Content.ReadAsStringAsync();

            //Dictionary<string, string> result = JsonConvert.DeserializeObject<Dictionary<string, string>>(_responseContent);
            //string token = result["access_token"];

            //client = new HttpClient();
            //var Authorization = $"Bearer {token}";
            //client.DefaultRequestHeaders.Add("Authorization", Authorization);
            //client.DefaultRequestHeaders.Add("Cache-Control", "no-cache");
            //client.DefaultRequestHeaders.Add("OData-Version", "4.0");
            //client.DefaultRequestHeaders.Add("Accept", "application/json");

            //string url = "https://spd-spice.dev.jag.gov.bc.ca/api/data/v9.0/accounts";

            //HttpRequestMessage _httpRequest = new HttpRequestMessage(HttpMethod.Get, url);

            //var _httpResponse2 = await client.SendAsync(_httpRequest);
            //HttpStatusCode _statusCode = _httpResponse2.StatusCode;

            //var _responseString = _httpResponse2.ToString();
            //var _responseContent2 = await _httpResponse2.Content.ReadAsStringAsync();

            //Console.Out.WriteLine(_responseContent2);
            return new Tuple<int, HttpResponseMessage>(100, null);
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
            public bool IsCompletedSuccessfully { get; set; }
            public string Result { get; set; }
        }
    }
}
