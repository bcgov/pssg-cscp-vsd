using Gov.Cscp.VictimServices.Public.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Rest;
using System.Net.Http;
using System.Net;
using System.Threading.Tasks;
using System;
using Serilog;
using Newtonsoft.Json;

namespace Gov.Cscp.VictimServices.Public.Services
{
    public interface IAEMResultService
    {
        Task<AEMResult> Post(string requestJson);
    }

    public class AEMResultService : IAEMResultService
    {
        private HttpClient _client;
        private IConfiguration _configuration;
        private readonly ILogger _logger;

        public AEMResultService(IConfiguration configuration, HttpClient httpClient)
        {
            _client = httpClient;
            _configuration = configuration;
            _logger = Log.Logger;
        }

        public async Task<AEMResult> Post(string modelJson)
        {
            AEMResult blob = await AEMResultAsync(modelJson);
            return blob;
        }

        private async Task<AEMResult> AEMResultAsync(string requestJson)
        {
            string endpointUrl = _configuration["AEM_INTERFACE_URI"];
            if (String.IsNullOrEmpty(endpointUrl))
            {
                AEMResult failResult = new AEMResult();
                failResult.responseCode = System.Net.HttpStatusCode.InternalServerError;
                failResult.responseMessage = "No AEM_INTERFACE_URI found. Verify project secrets are configured correctly.";
                return failResult;
            }
            requestJson = requestJson.Replace("fortunecookie", "@odata.");

            // Console.WriteLine(endpointUrl);
            // Console.WriteLine(requestJson);

            HttpRequestMessage _httpRequest = new HttpRequestMessage(HttpMethod.Post, endpointUrl);
            _httpRequest.Content = new StringContent(requestJson, System.Text.Encoding.UTF8, "application/json");

            var _httpResponse = await _client.SendAsync(_httpRequest);

            string resultString = await _httpResponse.Content.ReadAsStringAsync();
            AEMResult result= JsonConvert.DeserializeObject<AEMResult>(resultString); 
            // Console.WriteLine(result);

            if ((int)result.responseCode == 200)
            {
                HttpResponseMessage msg = await _client.GetAsync(result.responseMessage);
                byte[] msgContent = await msg.Content.ReadAsByteArrayAsync();
                result.responseMessage = Convert.ToBase64String(msgContent);
            }
            else
            {
                _logger.Error(new HttpOperationException($"Error calling API function {endpointUrl}. Source = VSD"), $"Error calling API function {endpointUrl}. Source = VSD. Error is:\n{result}\n\nJSON sent:{requestJson}", result, requestJson);
            }

            return result;
        }
    }
}