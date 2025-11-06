using System;
using System.IO;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Serialization;
using Gov.Cscp.VictimServices.Public.JsonObjects;
using Gov.Cscp.VictimServices.Public.Models;
using Gov.Cscp.VictimServices.Public.Models.Extensions;
using Gov.Cscp.VictimServices.Public.Services;
using Gov.Cscp.VictimServices.Public.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace Gov.Cscp.VictimServices.Public.Controllers
{
    [Route("api/[controller]")]
    public class AEMController : Controller
    {
        private readonly IAEMResultService _aemResultService;
        private readonly ILogger _logger;
        private readonly IDynamicsResultService _dynamicsResultService;

        public AEMController(IAEMResultService aemResultService, IDynamicsResultService dynamicsResultService)
        {
            this._aemResultService = aemResultService;
            _logger = Log.Logger;
            _dynamicsResultService = dynamicsResultService;
        }

        [HttpPost("victim")]
        public async Task<IActionResult> GetVictimApplicationPDF([FromBody] ApplicationFormModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.Error(
                        $"API call to 'GetVictimApplicationPDF' made with invalid model state. Error is:\n{ModelState}. Source = VSD"
                    );
                    return BadRequest(ModelState);
                }

                string xml = getApplicationXML(model);
                string requestJson = getAEMJSON(xml, "victim");

                AEMResult result = await _aemResultService.Post(requestJson);
                return StatusCode((int)result.responseCode, result);
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while getting victim application PDF. Source = VSD");
                return BadRequest();
            }
            finally { }
        }

        [HttpPost("ifm")]
        public async Task<IActionResult> GetIFMApplicationPDF([FromBody] ApplicationFormModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.Error(
                        $"API call to 'GetIFMApplicationPDF' made with invalid model state. Error is:\n{ModelState}. Source = VSD"
                    );
                    return BadRequest(ModelState);
                }

                string xml = getApplicationXML(model);
                string requestJson = getAEMJSON(xml, "ifm");

                AEMResult result = await _aemResultService.Post(requestJson);
                return StatusCode((int)result.responseCode, result);
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while getting ifm application PDF. Source = VSD");
                return BadRequest();
            }
            finally { }
        }

        [HttpPost("witness")]
        public async Task<IActionResult> GetWitnessApplicationPDF([FromBody] ApplicationFormModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.Error(
                        $"API call to 'GetWitnessApplicationPDF' made with invalid model state. Error is:\n{ModelState}. Source = VSD"
                    );
                    return BadRequest(ModelState);
                }

                string xml = getApplicationXML(model);
                string requestJson = getAEMJSON(xml, "witness");

                AEMResult result = await _aemResultService.Post(requestJson);
                return StatusCode((int)result.responseCode, result);
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while getting witness application PDF. Source = VSD");
                return BadRequest();
            }
            finally { }
        }

        [HttpPost("authorization")]
        public async Task<IActionResult> GetAuthorizationPDF([FromBody] ApplicationFormModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.Error(
                        $"API call to 'GetAuthorizationPDF' made with invalid model state. Error is:\n{ModelState}. Source = VSD"
                    );
                    return BadRequest(ModelState);
                }

                string xml = getApplicationXML(model);
                string requestJson = getAEMJSON(xml, "authorization");

                AEMResult result = await _aemResultService.Post(requestJson);
                return StatusCode((int)result.responseCode, result);
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while getting authorization PDF. Source = VSD");
                return BadRequest();
            }
            finally { }
        }

        [HttpPost("invoice")]
        public async Task<IActionResult> GetInvoicePDF([FromBody] CounsellorInvoiceFormModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.Error(
                        $"API call to 'GetInvoicePDF' made with invalid model state. Error is:\n{ModelState}. Source = VSD"
                    );
                    return BadRequest(ModelState);
                }

                string xml = getInvoiceXML(model);
                string requestJson = getAEMJSON(xml, "invoice");

                AEMResult result = await _aemResultService.Post(requestJson);
                return StatusCode((int)result.responseCode, result);
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while getting invoice PDF. Source = VSD");
                return BadRequest();
            }
            finally { }
        }

        private static string getApplicationXML(ApplicationFormModel model)
        {
            XmlSerializer xsSubmit = new XmlSerializer(typeof(ApplicationFormModel));
            var encoding = Encoding.GetEncoding("ISO-8859-1");
            XmlWriterSettings xmlWriterSettings = new XmlWriterSettings
            {
                Indent = true,
                OmitXmlDeclaration = false,
                Encoding = encoding,
            };

            string xml = "";
            using (var stream = new MemoryStream())
            {
                using (var xmlWriter = XmlWriter.Create(stream, xmlWriterSettings))
                {
                    xsSubmit.Serialize(xmlWriter, model);
                }
                xml = encoding.GetString(stream.ToArray());
            }

            xml = xml.Replace(" xsi:nil=\"true\"", "");
            xml = xml.Replace("data:image/png;base64,", "");
            xml = xml.Replace(" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"", "");
            xml = xml.Replace(" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\"", "");

            return xml;
        }

        private static string getInvoiceXML(CounsellorInvoiceFormModel model)
        {
            XmlSerializer xsSubmit = new XmlSerializer(typeof(CounsellorInvoiceFormModel));
            var encoding = Encoding.GetEncoding("ISO-8859-1");
            XmlWriterSettings xmlWriterSettings = new XmlWriterSettings
            {
                Indent = true,
                OmitXmlDeclaration = false,
                Encoding = encoding,
            };

            string xml = "";
            using (var stream = new MemoryStream())
            {
                using (var xmlWriter = XmlWriter.Create(stream, xmlWriterSettings))
                {
                    xsSubmit.Serialize(xmlWriter, model);
                }
                xml = encoding.GetString(stream.ToArray());
            }

            xml = xml.Replace(" xsi:nil=\"true\"", "");
            xml = xml.Replace("data:image/png;base64,", "");
            xml = xml.Replace(" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"", "");
            xml = xml.Replace(" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\"", "");

            return xml;
        }

        private static string getAEMJSON(string xml, string application_type)
        {
            string aem_app = "coast-cva"; //CVAP AEM app
            string aem_form = "";
            switch (application_type)
            {
                case "victim":
                    aem_form = "CVAP0001";
                    break;
                case "ifm":
                    aem_form = "CVAP0002";
                    break;
                case "witness":
                    aem_form = "CVAP0003";
                    break;
                case "authorization":
                    aem_form = "CVAP0004";
                    break;
                case "invoice":
                    aem_form = "CVAP0005";
                    break;
                default:
                    //form type not defined
                    break;
            }
            string document_format = "pdfa";

            var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(xml);
            var encoded = System.Convert.ToBase64String(plainTextBytes);

            string requestJson =
                "{\"aem_app\":\""
                + aem_app
                + "\","
                + "\"aem_form\":\""
                + aem_form
                + "\","
                + "\"document_format\":\""
                + document_format
                + "\","
                + "\"aem_xml_data\":\""
                + encoded
                + "\""
                + "}";

            return requestJson;
        }

        [HttpGet("generate/{pdfType}/{applicationId}")]
        public async Task<IActionResult> GenerateVictimApplicationPDF(string pdfType, string applicationId)
        {
            try
            {
                if (pdfType == "invoice")
                {
                    var invoiceEndpoint = $"vsd_invoices({applicationId})";
                    DynamicsResult invoiceResult = await _dynamicsResultService.Get(invoiceEndpoint);
                    var invoiceJson = invoiceResult.result.ToString();
                    CounsellorInvoiceFormDynamicsModel invoiceDynamics = new CounsellorInvoiceFormDynamicsModel();
                    invoiceDynamics = System.Text.Json.JsonSerializer.Deserialize<CounsellorInvoiceFormDynamicsModel>(
                        invoiceJson
                    );

                    var lineItemEndpoint = $"vsd_invoicelinedetails?$filter=_vsd_invoiceid_value eq {applicationId}";
                    DynamicsResult lineItemResult = await _dynamicsResultService.Get(lineItemEndpoint);
                    var lineItemJson = lineItemResult.result.ToString();
                    invoiceDynamics.InvoiceLineItems = System
                        .Text.Json.JsonSerializer.Deserialize<DynamicsCollection<LineItemDynamicsModel>>(lineItemJson)
                        .Value;

                    var invoice = invoiceDynamics.ToFormModel();

                    string invoice_xml = getInvoiceXML(invoice);
                    string invoice_requestJson = getAEMJSON(invoice_xml, pdfType);

                    AEMResult invoice_aemResult = await _aemResultService.Post(invoice_requestJson);
                    byte[] invoice_pdfBytes = Convert.FromBase64String(invoice_aemResult.responseMessage);

                    return File(
                        invoice_pdfBytes,
                        "application/pdf",
                        $"Invoice-{invoice.InvoiceDetails.vendorNumber}.pdf"
                    );
                }
                var endpoint = $"vsd_applications({applicationId})";
                DynamicsResult result = await _dynamicsResultService.Get(endpoint);
                var json = result.result.ToString();
                ApplicationDynamicsModel dynamics = new ApplicationDynamicsModel();
                dynamics.Application = System.Text.Json.JsonSerializer.Deserialize<Application>(json);

                var participantEndpoint = $"vsd_participants?$filter=_vsd_applicationid_value eq {applicationId}";
                DynamicsResult participantResult = await _dynamicsResultService.Get(participantEndpoint);
                var providers = System.Text.Json.JsonSerializer.Deserialize<DynamicsCollection<Providercollection>>(
                    participantResult.result.ToString()
                );
                dynamics.ProviderCollection = providers.Value;

                var policeEndpoint =
                    $"vsd_applicationpolicenumbers?$filter=_vsd_applicationid_value eq {applicationId}";
                DynamicsResult policeResult = await _dynamicsResultService.Get(policeEndpoint);
                var policeFileNumberCollection = System.Text.Json.JsonSerializer.Deserialize<
                    DynamicsCollection<Policefilenumbercollection>
                >(policeResult.result.ToString());
                dynamics.PoliceFileNumberCollection = policeFileNumberCollection.Value;

                var courtInfomationEndpoint =
                    $"vsd_applicationcourtinformations?$filter=_vsd_applicationid_value eq {applicationId}";
                DynamicsResult courtInfomationResult = await _dynamicsResultService.Get(courtInfomationEndpoint);
                var courtInfomationCollection = System.Text.Json.JsonSerializer.Deserialize<
                    DynamicsCollection<Courtinfocollection>
                >(courtInfomationResult.result.ToString());
                dynamics.CourtInfoCollection = courtInfomationCollection.Value;

                var application = dynamics.ToApplicationFormModel();

                string xml = getApplicationXML(application);
                string requestJson = getAEMJSON(xml, pdfType);

                AEMResult aemResult = await _aemResultService.Post(requestJson);
                byte[] pdfBytes = Convert.FromBase64String(aemResult.responseMessage);
                return File(pdfBytes, "application/pdf", $"{char.ToUpper(pdfType[0]) + pdfType[1..]}Application.pdf");
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while getting victim application PDF. Source = VSD");
                return BadRequest();
            }
            finally { }
        }

        public class DynamicsCollection<T>
        {
            [JsonPropertyName("value")]
            public T[] Value { get; set; }
        }
    }
}
