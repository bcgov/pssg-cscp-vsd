using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Linq;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Utilities;

namespace Manager.Contract;

// NOTE Coast has DEV, TEST, and PROD environments while CAS may only have TEST, and PROD (to be confirmed)
public class CasHttpClient : ICasHttpClient
{
    // TODO I remember there are some caveats to HttpClient scope and disposing, which is why the Extension DI register might be better if more HttpClients are added
    // Consider researching and implementing the commented out Extension method below, if time permits. I would assume the Extension would affectively get a HttpClient
    // from a pool of available HttpClient(s), and dispose of them properly. The downside at first glance seems to be you have multiple client api urls all cluttered
    // in one pool of HttpClient(s)
    // There is also the topic of disposing HttpClient, touched here https://stackoverflow.com/questions/15705092/do-httpclient-and-httpclienthandler-have-to-be-disposed-between-requests
    private HttpClient _httpClient = null;

    public void Initialize(string clientId, string clientKey, string url)
    {
        var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Add("clientID", clientId);
        httpClient.DefaultRequestHeaders.Add("secret", clientKey);
        httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        httpClient.BaseAddress = new Uri(url);
        httpClient.Timeout = new TimeSpan(1, 0, 0); // 1 hour timeout
        _httpClient = httpClient;
    }

    public async Task<bool> ApTransaction(CasApTransactionInvoices invoices)
    {
        if (_httpClient == null)
            throw new Exception("HttpClient not initialized. Call Initialize() first.");

        // TODO check defaultDistributionAccount is not null or empty
        var jsonRequest = invoices.ToJSONString();
        //var url = "https://wsgw.dev.jag.gov.bc.ca/victim/api/cas/api/CASAPTransaction";
        var url = $"{_httpClient.BaseAddress}victim/api/cas/api/CASAPTransaction";
        var httpContent = new StringContent(jsonRequest, Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync(url, httpContent);
        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"Request {url} returned {response.StatusCode} status code.");
        }
        var httpResponse = await response.Content.ReadAsStringAsync();

        var jsonReader = System.Runtime.Serialization.Json.JsonReaderWriterFactory.CreateJsonReader(
            Encoding.UTF8.GetBytes(httpResponse),
            new XmlDictionaryReaderQuotas()
        );

        var root = XElement.Load(jsonReader);
        if (root.Element("CAS-Returned-Messages") != null)
        {
            var casReturnedMessages = root.Element("CAS-Returned-Messages");
            if (casReturnedMessages != null)
            {
                if (
                    !(
                        casReturnedMessages.Value.Equals("SUCCEEDED", StringComparison.InvariantCultureIgnoreCase)
                        | casReturnedMessages.Value.Contains("Duplicate Submission")
                    )
                )
                    throw new Exception(casReturnedMessages.Value + "\r\n" + jsonRequest);
            }
            else
                throw new Exception(httpResponse + "\r\n" + jsonRequest);
        }
        else
            throw new Exception(httpResponse + "\r\n" + jsonRequest);

        return true;
    }
}

//public static class CasHttpClientExtensions
//{
//    public static IServiceCollection AddHttpClient(this IServiceCollection services, string clientKey, string clientId, string url)
//    {
//        // TODO add http client request logger e.g. interceptor or decorator
//        //Log.AppendLine("Sending Json: " + jsonRequest.ToString());
//        var httpClient = new HttpClient();
//        httpClient.DefaultRequestHeaders.Add("clientID", clientId);
//        httpClient.DefaultRequestHeaders.Add("secret", clientKey);
//        httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
//        httpClient.BaseAddress = new Uri(url);
//        httpClient.Timeout = new TimeSpan(1, 0, 0);  // 1 hour timeout

//        services.AddHttpClient<ICasHttpClient, CasHttpClient>(serviceProvider => new CasHttpClient(httpClient));
//        return services;
//    }
//}
