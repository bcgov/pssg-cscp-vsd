using Gov.Jag.VictimServices.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Net;

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
            var t = Task.Run(() => CreateCaseAction());
            t.Wait();

            var result = new { Status = "Api Test Run" };
            return new JsonResult(result);
        }

        static void Main(string[] args)
        {
            var t = Task.Run(() => CreateCaseAction());
            t.Wait();

            Console.WriteLine();
            Console.ReadLine();
        }

        private static async Task<HttpResponseMessage> CreateCaseAction()
        {
            HttpClient httpClient = null;
            try
            {
                string dynamicsOdataUri = "";
                string aadTenantId = "";
                string serverAppIdUri = "";
                string clientKey = "";
                string clientId = "";

                string ssgUsername = "";
                string ssgPassword = "";

                AuthenticationResult authenticationResult = null;
                // authenticate using ADFS.
                if (string.IsNullOrEmpty(ssgUsername) || string.IsNullOrEmpty(ssgPassword))
                {
                    var authenticationContext = new AuthenticationContext(
                        "https://login.windows.net/" + aadTenantId);
                    ClientCredential clientCredential = new ClientCredential(clientId, clientKey);
                    var task = authenticationContext.AcquireTokenAsync(serverAppIdUri, clientCredential);
                    task.Wait();
                    authenticationResult = task.Result;
                }

                httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", authenticationResult.AccessToken);
                httpClient.BaseAddress = new Uri(string.Join("/", dynamicsOdataUri, "vsd_CreateCaseFromOpenShift"));
                httpClient.Timeout = new TimeSpan(1, 0, 0);  // 1 hour timeout  
                httpClient.DefaultRequestHeaders.Add("OData-MaxVersion", "4.0");
                httpClient.DefaultRequestHeaders.Add("OData-Version", "4.0");
                httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "vsd_CreateCaseFromOpenShift");
                request.Content = new StringContent("{\"Application\":{\"vsd_name\":\"Test from OS\",\"@odata.type\":\"Microsoft.Dynamics.CRM.vsd_application\"}}", Encoding.UTF8, "application/json");

                HttpResponseMessage response = await httpClient.SendAsync(request);

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    var jsonResult = response.Content.ReadAsStringAsync().Result;
                }

                return response;
            }
            finally
            {
                if (httpClient != null)
                    httpClient.Dispose();
            }
        }
    }
}
