using Gov.Jag.VictimServices.Public.JsonObjects;
using Gov.Jag.VictimServices.Public.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace Gov.Jag.VictimServices.Public.Controllers
{
    [Route("api/[controller]")]
    public class JusticeController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public JusticeController(IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpPost("saveapplication")]
        public async Task<IActionResult> SaveApplication([FromBody] ApplicationModel model)
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

        [HttpGet("getdata")]
        public ActionResult Sample()
        {
            var application = GetApplicationData();
            var applicationJson = JsonConvert.SerializeObject(application);

            return new JsonResult(applicationJson);
        }

        private static async Task<string> CreateCaseAction(IConfiguration configuration, ApplicationModel model)
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

                var application = GetApplicationData();
                application.Application.VsdApplicanttype = (long)ApplicationType.Victim;

                // Temporary hijack of this code to just get this wired up -- all of this should auto bind
                if (model != null)
                {
                    if (model.PersonalInformation != null)
                    {
                        // Override default properties with values we know are being set -- Temporary demo patch
                        //                        if (!string.IsNullOrWhiteSpace(model.PersonalInformation.firstName))
                        application.Application.VsdApplicantsfirstname = model.PersonalInformation.firstName;

                        if (!string.IsNullOrWhiteSpace(model.PersonalInformation.middleName))
                            application.Application.VsdApplicantsmiddlename = model.PersonalInformation.middleName;

                        //                        if (!string.IsNullOrWhiteSpace(model.PersonalInformation.lastName))
                        application.Application.VsdApplicantslastname = model.PersonalInformation.lastName;

                        if (!string.IsNullOrWhiteSpace(model.PersonalInformation.otherFirstName))
                            application.Application.VsdApplicantsotherfirstname = model.PersonalInformation.otherFirstName;

                        if (!string.IsNullOrWhiteSpace(model.PersonalInformation.otherLastName))
                            application.Application.VsdApplicantsotherlastname = model.PersonalInformation.otherLastName;

                        // Should strip and reformat number here
                        if (!string.IsNullOrWhiteSpace(model.PersonalInformation.phoneNumber))
                            application.Application.VsdApplicantsprimaryphonenumber = model.PersonalInformation.phoneNumber;

                        if (!string.IsNullOrWhiteSpace(model.PersonalInformation.email))
                            application.Application.VsdApplicantsemail = model.PersonalInformation.email;

                        if (!string.IsNullOrWhiteSpace(model.PersonalInformation.sinPart1) && !string.IsNullOrWhiteSpace(model.PersonalInformation.sinPart2) && !string.IsNullOrWhiteSpace(model.PersonalInformation.sinPart3))
                            application.Application.VsdApplicantssocialinsurancenumber = $"{ model.PersonalInformation.sinPart1 }-{ model.PersonalInformation.sinPart2 }-{ model.PersonalInformation.sinPart3}"; ;

                        if (model.PersonalInformation.birthDate.HasValue)
                            application.Application.VsdApplicantsbirthdate = model.PersonalInformation.birthDate.Value;

                        if (model.PersonalInformation.gender > 0)
                            application.Application.VsdApplicantsgendercode = model.PersonalInformation.gender;

                        if (model.PersonalInformation.maritalStatus > 0)
                            application.Application.VsdApplicantsmaritalstatus = model.PersonalInformation.maritalStatus;

                        application.Application.VsdApplicantsoccupation = model.PersonalInformation.occupation;

                        if (model.PersonalInformation.primaryAddress != null)
                        {
                            application.Application.vsd_applicantsprimaryaddressline1 = model.PersonalInformation.primaryAddress.line1;
                            application.Application.vsd_applicantsprimaryaddressline2 = model.PersonalInformation.primaryAddress.line2;
                            application.Application.vsd_applicantsprimarycity = model.PersonalInformation.primaryAddress.city;
                            application.Application.vsd_applicantsprimaryprovince = model.PersonalInformation.primaryAddress.province;
                            application.Application.vsd_applicantsprimarycountry = model.PersonalInformation.primaryAddress.country;
                            application.Application.vsd_applicantsprimarypostalcode = model.PersonalInformation.primaryAddress.postalcode;
                        }

                        if (model.PersonalInformation.alternateAddress != null)
                        {
                            application.Application.vsd_applicantsalternateaddressline1 = model.PersonalInformation.alternateAddress.line1;
                            application.Application.vsd_applicantsalternateaddressline2 = model.PersonalInformation.alternateAddress.line2;
                            application.Application.vsd_applicantsalternatecity = model.PersonalInformation.alternateAddress.city;
                            application.Application.vsd_applicantsalternateprovince = model.PersonalInformation.alternateAddress.province;
                            application.Application.vsd_applicantsalternatecountry = model.PersonalInformation.alternateAddress.country;
                            application.Application.vsd_applicantsalternatepostalcode = model.PersonalInformation.alternateAddress.postalcode;
                        }
                    }

                    if (model.CrimeInformation != null)
                    {
                        application.Application.VsdCvapTypeofcrime = model.CrimeInformation.typeOfCrime;
                        if (model.CrimeInformation.crimePeriodStart.HasValue)
                            application.Application.VsdCvapCrimestartdate = model.CrimeInformation.crimePeriodStart.Value;
                        if (model.CrimeInformation.crimePeriodEnd.HasValue)
                            application.Application.VsdCvapCrimeenddate = model.CrimeInformation.crimePeriodEnd.Value;
                        application.Application.VsdCvapCrimelocations = model.CrimeInformation.crimeLocation;
                        application.Application.VsdCvapCrimeDetails = model.CrimeInformation.crimeDetails;
                        application.Application.VsdCvapInjuries = model.CrimeInformation.crimeInjuries;
                    }
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

        //        private static string FormatDateToJson(DateTime? date)
        //        {
        //            if (!date.HasValue)
        //                return string.Empty;

        //            // Date Format "2018-06-03T00:00:00",
        ////            return date.Value.Date.Format("");
        //        }

        private enum ApplicationType
        {
            Victim = 100000002,
            ImmediateFamilyMember = 100000001,
            Witness = 100000000
        }

        private static ApplicationRoot GetApplicationData()
        {
            var application = new ApplicationRoot();
            application.Application = new Application
            {
                OdataType = "Microsoft.Dynamics.CRM.vsd_application",
                VsdApplicanttype = 100000002,
                //                VsdApplicantsfirstname = "CVAP DEV",
                //                VsdApplicantslastname = "Form Test",
                //VsdApplicantsbirthdate = "1982-05-05T00:00:00",
                //                VsdApplicantsbirthdate = new DateTime(1983, 6, 4), //"1982-05-05T00:00:00",
                //                VsdApplicantsgendercode = 100000000,
                //                VsdApplicantsmaritalstatus = 100000000,
                //                VsdCvapTypeofcrime = "Break-in",
                VsdApplicantsemail = "test@test.com",
                VsdApplicantsprimaryphonenumber = "250-444-5656",

                VsdCvapCrimestartdate = new DateTime(2018, 6, 14), //"2018-06-03T00:00:00",
                VsdApplicantssignature = "Crime Victim Guy",
                VsdCvapAuthorizationsigneddate = "2019-02-07T00:00:00",
                VsdCvapDeclarationsigneddate = "2019-02-07T00:00:00",
                VsdCvapOnbehalfofdeclaration = 100000000,
            };

            application.CourtInfoCollection = new List<CourtInfoCollection>
                {
                    new CourtInfoCollection
                    {
                        OdataType = "Microsoft.Dynamics.CRM.vsd_applicationcourtinformation",
                        VsdCourtfilenumber = "1234567",
                        VsdCourtlocation = "Victoria"
                    }
                };
            application.ProviderCollection = new List<ProviderCollection>
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
