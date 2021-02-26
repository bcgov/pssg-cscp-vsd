using Gov.Cscp.VictimServices.Public.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Rest;
using Serilog;
using System.Net.Http;
using System.Net;
using System.Threading.Tasks;
using System;

namespace Gov.Cscp.VictimServices.Public.Services
{
    public interface IDynamicsResultService
    {
        Task<DynamicsResult> Get(string endpointUrl);
        Task<DynamicsResult> Post(string endpointUrl, string requestJson);
    }

    public class DynamicsResultService : IDynamicsResultService
    {
        private HttpClient _client;
        private IConfiguration _configuration;
        private readonly ILogger _logger;

        public DynamicsResultService(IConfiguration configuration, HttpClient httpClient)
        {
            _client = httpClient;
            _configuration = configuration;
            _logger = Log.Logger;
        }

        public async Task<DynamicsResult> Get(string endpointUrl)
        {
            DynamicsResult blob = await DynamicsResultAsync(HttpMethod.Get, endpointUrl, "");
            return blob;
        }

        public async Task<DynamicsResult> Post(string endpointUrl, string modelJson)
        {
            DynamicsResult blob = await DynamicsResultAsync(HttpMethod.Post, endpointUrl, modelJson);
            return blob;
        }

        private async Task<DynamicsResult> DynamicsResultAsync(HttpMethod method, string endpointUrl, string requestJson)
        {
            endpointUrl = _configuration["DYNAMICS_ODATA_URI"] + endpointUrl;
            requestJson = requestJson.Replace("fortunecookie", "@odata.");

            // Console.WriteLine(endpointUrl);
            // Console.WriteLine(requestJson);

            HttpRequestMessage _httpRequest = new HttpRequestMessage(method, endpointUrl);
            _httpRequest.Content = new StringContent(requestJson, System.Text.Encoding.UTF8, "application/json");

            var _httpResponse = await _client.SendAsync(_httpRequest);
            HttpStatusCode _statusCode = _httpResponse.StatusCode;

            var _responseContent = await _httpResponse.Content.ReadAsStringAsync();

            var result = new DynamicsResult();
            result.statusCode = _statusCode;
            result.responseMessage = _httpResponse;
            var clean = _responseContent.Replace("@odata.", "fortunecookie");
            result.result = Newtonsoft.Json.Linq.JObject.Parse(clean);

            if (result.result.ContainsKey("IsSuccess") && result.result["IsSuccess"].ToString().Equals("False"))
            {
                _logger.Information(new HttpOperationException($"Received a fail response from {endpointUrl}. Source = VSD"), $"COAST resturned IsSuccess = False. \nSource = VSD. \nError is:\n{result.result}\n\nJSON sent:{requestJson}", result.result, requestJson);
            }

            if (_statusCode == HttpStatusCode.InternalServerError)
            {
                _logger.Error(new HttpOperationException($"Error calling API function {endpointUrl}. Source = VSD"), $"Error calling API function {endpointUrl}. \nSource = VSD. \nError is:\n{result.result}\n\nJSON sent:{requestJson}", result.result, requestJson);
            }

            // Console.WriteLine(result.result);

            return result;
        }
    }
}