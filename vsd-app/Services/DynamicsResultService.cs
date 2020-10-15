using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using Microsoft.Rest;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Net.Http;
using System.Net;
using System.Threading.Tasks;
using System;
using Gov.Cscp.VictimServices.Public.Models;

namespace Gov.Cscp.VictimServices.Public.Services
{
    public class DynamicsResultService : IDynamicsResultService
    {
        private IConfiguration _configuration;
        private IHttpContextAccessor _httpContextAccessor;
        private HttpClient _client;
        private DateTime _accessTokenExpiration;
        private Boolean _didInit;

        public DynamicsResultService(IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            this._configuration = configuration;
            this._httpContextAccessor = httpContextAccessor;
            // we set the datetime to now because when the first request happens it will trigger the authentication to Dynamics
            this._accessTokenExpiration = DateTime.Now;
            this._didInit = true;
        }

        public async Task<DynamicsResult> GetResultAsync(string endpointUrl)
        {
            DynamicsResult blob = await DynamicsResultAsync(endpointUrl, "");
            return blob;
        }

        public async Task<DynamicsResult> GetResultAsync(string endpointUrl, string requestJson)
        {
            //Note:  get and set are the same for now but we want to make it easy to know which action to take
            DynamicsResult blob = await DynamicsResultAsync(endpointUrl, requestJson);
            return blob;
        }

        public async Task<DynamicsResult> SetDataAsync(string endpointUrl, string modelJson)
        {
            //Note:  get and set are the same for now but we want to make it easy to know which action to take
            DynamicsResult blob = await DynamicsResultAsync(endpointUrl, modelJson);
            return blob;
        }

        private async Task<DynamicsResult> DynamicsResultAsync(string endpointUrl, string requestJson)
        {
            // if the value of the return is greater than zero we know that "now" is after expiry of the token
            // if there is no access token expiration then this must be a new instance that has never handled a connection yet.
            if (DateTime.Now.CompareTo(_accessTokenExpiration) > 0 || !(this._didInit == true))
            {
                this._didInit = true;
                // we need a new connection and perform action
                bool success = await MakeConnection();
                if (success)
                {
                    // perform action is the thing that we want to wait on the return for
                    return await PerformAction(_client, endpointUrl, requestJson);
                }
                else
                {
                    // there is a problem. Return it to the user.
                    DynamicsResult r = new DynamicsResult();
                    r.statusCode = System.Net.HttpStatusCode.BadGateway;
                    r.result = JObject.Parse("{\"message\":\"A connection to Dynamics couldn't be established for some reason.\"}");
                    return r;
                }
            }
            else
            {
                // perform action is the thing that we want to wait on the return for
                // this else will happen when there is a fresh connection
                return await PerformAction(_client, endpointUrl, requestJson);
            }
        }
        private async Task<DynamicsResult> PerformAction(HttpClient client, string endpointUrl, string requestJson)
        {
            // this is a generic action for dynamics. It could be set or get.
            // add the dynamics url
            endpointUrl = _configuration["DYNAMICS_ODATA_URI"] + endpointUrl;

            HttpRequestMessage _httpRequest;
            if (string.IsNullOrEmpty(requestJson))
            {
                _httpRequest = new HttpRequestMessage(HttpMethod.Get, endpointUrl);
            }
            else
            {
                // replace all the fortune cookies with @odata.
                requestJson = requestJson.Replace("fortunecookie", "@odata.");
                _httpRequest = new HttpRequestMessage(HttpMethod.Post, endpointUrl);
                _httpRequest.Content = new StringContent(requestJson, System.Text.Encoding.UTF8, "application/json");
                Console.WriteLine(requestJson);
                //easily view sent json to dynamics
            }

            var _httpResponse2 = await _client.SendAsync(_httpRequest);
            HttpStatusCode _statusCode = _httpResponse2.StatusCode;

            var _responseString = _httpResponse2.ToString();
            var _responseContent2 = await _httpResponse2.Content.ReadAsStringAsync();
            // replace the odata with a string that can be converted to a dotnet core property

            // save the result to a returnable object
            var result = new DynamicsResult();
            result.statusCode = _statusCode;
            result.responseMessage = _httpResponse2;
            var clean = _responseContent2.Replace("@odata.", "fortunecookie");
            result.result = Newtonsoft.Json.Linq.JObject.Parse(clean);

            //easily view CRM response
            Console.WriteLine(result.result);
            // send the result back
            return result;
        }

        private async Task<bool> MakeConnection()
        {
            try
            {
                // ****************COLLECT CONFIGURATION*************
                string adfsOauth2Uri = _configuration["ADFS_OAUTH2_URI"];
                string applicationGroupResource = _configuration["DYNAMICS_APP_GROUP_RESOURCE"];
                string applicationGroupClientId = _configuration["DYNAMICS_APP_GROUP_CLIENT_ID"];
                string applicationGroupSecret = _configuration["DYNAMICS_APP_GROUP_SECRET"];
                string serviceAccountUsername = _configuration["DYNAMICS_USERNAME"];
                string serviceAccountPassword = _configuration["DYNAMICS_PASSWORD"];

                Microsoft.Rest.ServiceClientCredentials serviceClientCredentials = null;

                // all credentials must be in place for ADFS authorization
                if (!string.IsNullOrEmpty(adfsOauth2Uri) &&
                    !string.IsNullOrEmpty(applicationGroupResource) &&
                    !string.IsNullOrEmpty(applicationGroupClientId) &&
                    !string.IsNullOrEmpty(applicationGroupSecret) &&
                    !string.IsNullOrEmpty(serviceAccountUsername) &&
                    !string.IsNullOrEmpty(serviceAccountPassword))
                {
                    // create a new HTTP client that is just used to get a token.
                    var stsClient = new HttpClient();

                    stsClient.DefaultRequestHeaders.Add("x-client-SKU", "PCL.CoreCLR");
                    stsClient.DefaultRequestHeaders.Add("x-client-Ver", "5.1.0.0");
                    stsClient.DefaultRequestHeaders.Add("x-ms-PKeyAuth", "1.0");
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
                    var _httpResponse = await stsClient.PostAsync(adfsOauth2Uri, content);
                    // response should be in JSON format.
                    var _responseContent = await _httpResponse.Content.ReadAsStringAsync();

                    try
                    {
                        // make a JObject that we can query without worrying about casting
                        JObject response = JObject.Parse(_httpResponse.Content.ReadAsStringAsync().GetAwaiter().GetResult());
                        // grab the token
                        string token = response.GetValue("access_token").ToString();
                        // grab the time offset
                        int expirationSeconds;
                        bool secondsParsed = int.TryParse(response.GetValue("expires_in").ToString(), out expirationSeconds);

                        if (!secondsParsed)
                        {
                            expirationSeconds = 3600;
                            throw new Exception("The expiration seconds were not parsed so a default of one hour is used.");
                        }
                        if (token == null)
                        {
                            //token problem
                            return false;
                            throw new Exception("The token couldn't be parsed.");
                        }

                        // set global access token expiry time to the value returned subtract 60 seconds for minute long authentication communication delays
                        this._accessTokenExpiration = DateTime.Now.AddSeconds(expirationSeconds - 60);

                        // set the bearer token.
                        serviceClientCredentials = new TokenCredentials(token);


                        // Collect the client in the global client and save an expiration time in the global expiration
                        _client = new HttpClient();
                        _client.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");
                        _client.DefaultRequestHeaders.Add("OData-MaxVersion", "4.0");
                        _client.DefaultRequestHeaders.Add("OData-Version", "4.0");
                        _client.DefaultRequestHeaders.Add("Accept", "application/json");

                        // return the client 
                        return true;
                    }
                    catch (Exception e)
                    {
                        // we couldn't make an appropriate object from what was returned to establish a connection
                        return false;
                        throw new Exception(e.Message);
                    }
                }
                else
                {
                    // something went wrong because we failed during the connection process
                    return false;
                    throw new Exception("No configured connection to Dynamics.");
                }
            }
            catch (Exception e)
            {
                // generic error catchall
                return true;
                throw e;
            }
        }
    }
}