using Gov.Cscp.VictimServices.Public.Models;
using Gov.Cscp.VictimServices.Public.Services;
using Gov.Cscp.VictimServices.Public.ViewModels;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Xml.Serialization;
using System.Xml;
using System.IO;
using System.Text;

namespace Gov.Cscp.VictimServices.Public.Controllers
{
    [Route("api/[controller]")]
    public class AEMController : Controller
    {
        private readonly IAEMResultService _aemResultService;

        public AEMController(IAEMResultService aemResultService)
        {
            this._aemResultService = aemResultService;
        }

        [HttpPost("victim")]
        public async Task<IActionResult> GetVictimApplicationPDF([FromBody] ApplicationFormModel model)
        {
            try
            {
                string xml = getApplicationXML(model);
                string requestJson = getAEMJSON(xml, "victim");

                AEMResult result = await _aemResultService.Post(requestJson);
                return StatusCode((int)result.responseCode, result);
            }
            finally { }
        }

        [HttpPost("ifm")]
        public async Task<IActionResult> GetIFMApplicationPDF([FromBody] ApplicationFormModel model)
        {
            try
            {
                string xml = getApplicationXML(model);
                string requestJson = getAEMJSON(xml, "ifm");

                AEMResult result = await _aemResultService.Post(requestJson);
                return StatusCode((int)result.responseCode, result);
            }
            finally { }
        }

        [HttpPost("witness")]
        public async Task<IActionResult> GetWitnessApplicationPDF([FromBody] ApplicationFormModel model)
        {
            try
            {
                string xml = getApplicationXML(model);
                string requestJson = getAEMJSON(xml, "witness");

                AEMResult result = await _aemResultService.Post(requestJson);
                return StatusCode((int)result.responseCode, result);
            }
            finally { }
        }

        [HttpPost("authorization")]
        public async Task<IActionResult> GetAuthorizationPDF([FromBody] ApplicationFormModel model)
        {
            try
            {
                string xml = getApplicationXML(model);
                string requestJson = getAEMJSON(xml, "authorization");

                AEMResult result = await _aemResultService.Post(requestJson);
                return StatusCode((int)result.responseCode, result);
            }
            finally { }
        }

        [HttpPost("invoice")]
        public async Task<IActionResult> GetInvoicePDF([FromBody] CounsellorInvoiceFormModel model)
        {
            try
            {
                string xml = getInvoiceXML(model);
                string requestJson = getAEMJSON(xml, "invoice");

                AEMResult result = await _aemResultService.Post(requestJson);
                return StatusCode((int)result.responseCode, result);
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
                Encoding = encoding
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
                Encoding = encoding
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

            string requestJson = "{\"aem_app\":\"" + aem_app + "\"," +
            "\"aem_form\":\"" + aem_form + "\"," +
            "\"document_format\":\"" + document_format + "\"," +
            "\"aem_xml_data\":\"" + encoded + "\"" +
            "}";

            return requestJson;
        }
    }
}
