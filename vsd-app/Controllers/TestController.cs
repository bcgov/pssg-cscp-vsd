using Gov.Jag.VictimServices.Interfaces;
using Gov.Jag.VictimServices.Public.JsonObjects;
using Gov.Jag.VictimServices.Public.Utils;
using Gov.Jag.VictimServices.Public.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using Newtonsoft.Json;
using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Gov.Jag.VictimServices.Public.Controllers
{
    [Route("api/[controller]")]
    public class TestController : Controller
    {
        private readonly BCeIDBusinessQuery _bceid;
        private readonly IConfiguration Configuration;
        //private readonly SharePointFileManager _sharePointFileManager;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;

        public TestController(IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            Configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
        }

        /// GET account in Dynamics for the current user
        [HttpGet("apitest")]
        public async Task<IActionResult> ApiTest()
        {
            var t = Task.Run(() => CreateCaseAction(Configuration));
            t.Wait();

            var result = new { Status = "Api Test Run", Message = t.Result };
            return new JsonResult(result);
        }

        [HttpPut("saveapplication")]
        public async Task<IActionResult> SaveApplication(ApplicationModel model)
        {
//            _logger.LogInformation(LoggingEvents.HttpPut, "Begin method " + this.GetType().Name + "." + MethodBase.GetCurrentMethod().ReflectedType.Name);
//            _logger.LogDebug(LoggingEvents.HttpPut, "Account parameter: " + JsonConvert.SerializeObject(model));

            var t = Task.Run(() => CreateCaseAction(Configuration, model));
            t.Wait();

            var result = new { Status = "Api Save Test", Message = t.Result };
            return new JsonResult(result);
        }
        
        [HttpGet("getdata")]
        public ActionResult Sample()
        {
            var application = GetApplicationData();
            var applicationJson = JsonConvert.SerializeObject(application);

            return new JsonResult(applicationJson);
        }

        private static async Task<string> CreateCaseAction(IConfiguration configuration, ApplicationModel model = null)
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

                ApplicationRoot application = GetApplicationData();

                // Temporary hijack of this code to just get this wired up
                if (model != null)
                {
                    if (!string.IsNullOrWhiteSpace(model.applicantsfirstname))
                        application.Application.VsdApplicantsfirstname = model.applicantsfirstname;
                    else
                        application.Application.VsdApplicantsfirstname += " [notset]";

                    if (!string.IsNullOrWhiteSpace(model.applicantslastname))
                        application.Application.VsdApplicantslastname = model.applicantslastname;
                    else
                        application.Application.VsdApplicantslastname += " [notset]";
                }

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

        private static ApplicationRoot GetApplicationData()
        {
            var application = new ApplicationRoot();
            application.Application = new Application
            {
                OdataType = "Microsoft.Dynamics.CRM.vsd_application",
                VsdApplicanttype = 100000002,
                VsdApplicantsfirstname = "N41",
                VsdApplicantslastname = "Test 5",
                VsdApplicantsbirthdate = "2000-04-01T00:00:00",
                VsdApplicantsgendercode = 100000000,
                VsdCvapTypeofcrime = "Faux Pas",
                VsdApplicantsemail = "test@test.com",
                VsdApplicantsprimaryphonenumber = "250-444-5656",

                VsdCvapCrimestartdate = "2018-04-01T00:00:00",
                VsdApplicantssignature = "Crime Victim Guy",
                VsdCvapAuthorizationsigneddate = "2019-02-07T00:00:00",
                VsdCvapDeclarationsigneddate = "2019-02-07T00:00:00",
                VsdCvapOnbehalfofdeclaration = 100000000,
            };

            application.CourtInfoCollection = new System.Collections.Generic.List<CourtInfoCollection>
                {
                    new CourtInfoCollection
                    {
                        OdataType = "Microsoft.Dynamics.CRM.vsd_applicationcourtinformation",
                        VsdCourtfilenumber = "1234567",
                        VsdCourtlocation = "Victoria"
                    }
                };
            application.ProviderCollection = new System.Collections.Generic.List<ProviderCollection>
                {
                    new ProviderCollection
                    {
                        OdataType = "Microsoft.Dynamics.CRM.vsd_applicationserviceprovider",
                        VsdProvidername = "Mr. Smith",
                        VsdType = 100000000
                    }
                };
            return application;
        }
    }
}
