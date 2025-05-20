using System.Net;
using System.Net.Http;
using Newtonsoft.Json.Linq;

namespace Gov.Cscp.VictimServices.Public.Models
{
    public class DynamicsResult
    {
        public HttpResponseMessage responseMessage { get; set; }
        public JObject result { get; set; }
        public HttpStatusCode statusCode { get; set; }
    }
}
