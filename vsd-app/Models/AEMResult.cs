using System.Net;

namespace Gov.Cscp.VictimServices.Public.Models
{
    public class AEMResult
    {
        public string responseMessage { get; set; }
        public HttpStatusCode responseCode { get; set; }
    }
}