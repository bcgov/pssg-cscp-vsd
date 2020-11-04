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
                string requestJson = getAEMJSON(model, "victim");

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
                string requestJson = getAEMJSON(model, "ifm");

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
                string requestJson = getAEMJSON(model, "witness");

                AEMResult result = await _aemResultService.Post(requestJson);
                return StatusCode((int)result.responseCode, result);
            }
            finally { }
        }

        private static string getAEMJSON(ApplicationFormModel model, string application_type)
        {
            XmlSerializer xsSubmit = new XmlSerializer(typeof(ApplicationFormModel));
            var encoding = Encoding.GetEncoding("ISO-8859-1");
            XmlWriterSettings xmlWriterSettings = new XmlWriterSettings
            {
                Indent = true,
                OmitXmlDeclaration = false,
                Encoding = encoding
            };

            string xml2 = "";
            using (var stream = new MemoryStream())
            {
                using (var xmlWriter = XmlWriter.Create(stream, xmlWriterSettings))
                {
                    xsSubmit.Serialize(xmlWriter, model);
                }
                xml2 = encoding.GetString(stream.ToArray());
            }

            xml2 = xml2.Replace(" xsi:nil=\"true\"", "");
            xml2 = xml2.Replace("data:image/png;base64,", "");
            xml2 = xml2.Replace(" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"", "");
            xml2 = xml2.Replace(" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\"", "");

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
                default:
                    //form type not defined
                    break;
            }
            string document_format = "pdfa";

            var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(xml2);
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
