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
        public async Task<IActionResult> SaveApplication([FromBody] ApplicationModel model)
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

                // Temporary hijack of this code to just get this wired up -- all of this should auto bind
                if (model != null)
                {
                    // Override default properties with values we know are being set -- Temporary demo patch
                    if (!string.IsNullOrWhiteSpace(model.applicantsfirstname))
                        application.Application.VsdApplicantsfirstname = model.applicantsfirstname;

                    if (!string.IsNullOrWhiteSpace(model.applicantslastname))
                        application.Application.VsdApplicantsmiddlename = model.applicantsmiddlename;

                    if (!string.IsNullOrWhiteSpace(model.applicantslastname))
                        application.Application.VsdApplicantslastname = model.applicantslastname;

                    if (!string.IsNullOrWhiteSpace(model.applicantsotherfirstname))
                        application.Application.VsdApplicantsotherfirstname = model.applicantsotherfirstname;

                    if (!string.IsNullOrWhiteSpace(model.applicantsotherlastname))
                        application.Application.VsdApplicantsotherlastname = model.applicantsotherlastname;

                    if (!string.IsNullOrWhiteSpace(model.applicantsphoneNumber))
                        application.Application.VsdApplicantsprimaryphonenumber = model.applicantsphoneNumber;

                    if (!string.IsNullOrWhiteSpace(model.applicantsotherlastname))
                        application.Application.VsdApplicantsemail = model.applicantsemail;

                    // Try set birthdate here

                    if (model.applicantsgender > 0)
                        application.Application.VsdApplicantsgendercode = model.applicantsgender;

                    if (model.applicantsmaritalstatus > 0)
                        application.Application.VsdApplicantsmaritalstatus = model.applicantsmaritalstatus;


                    if (!string.IsNullOrWhiteSpace(model.typeofcrime))
                        application.Application.VsdCvapTypeofcrime = model.typeofcrime;
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
                VsdApplicantsfirstname = "CVAP",
                VsdApplicantslastname = "Form Test",
                VsdApplicantsbirthdate = "1980-05-05T00:00:00",
                VsdApplicantsgendercode = 100000000,
                VsdApplicantsmaritalstatus = 100000000,
                VsdCvapTypeofcrime = "Break-in",
                VsdApplicantsemail = "test@test.com",
                VsdApplicantsprimaryphonenumber = "250-444-5656",

                VsdCvapCrimestartdate = "2018-06-03T00:00:00",
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
