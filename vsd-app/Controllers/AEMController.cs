using Gov.Cscp.VictimServices.Public.Models;
using Gov.Cscp.VictimServices.Public.Services;
using Gov.Cscp.VictimServices.Public.ViewModels;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Xml.Serialization;
using System.Xml;
using System.IO;
using System.Text;
using System;

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

        [HttpPost("getPDF")]
        //[FromBody] AEMInterfaceModel model
        public async Task<IActionResult> GetPDF([FromBody] ApplicationFormModel model)
        {
            try
            {
                string xml2 = "";
                var encoding = Encoding.GetEncoding("ISO-8859-1");
                XmlSerializer xsSubmit = new XmlSerializer(typeof(ApplicationFormModel));

                XmlWriterSettings xmlWriterSettings = new XmlWriterSettings
                {
                    Indent = true,
                    OmitXmlDeclaration = false,
                    Encoding = encoding
                };

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

                string aem_app = "coast-cva";
                string aem_form = "CVAP0001";
                string document_format = "pdfa";

                var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(xml2);
                var encoded = System.Convert.ToBase64String(plainTextBytes);

                string requestJson = "{\"aem_app\":\"" + aem_app + "\"," +
                "\"aem_form\":\"" + aem_form + "\"," +
                "\"document_format\":\"" + document_format + "\"," +
                "\"aem_xml_data\":\"" + encoded + "\"" +
                "}";

                AEMResult result = await _aemResultService.Post(requestJson);
                int code = (int)result.responseCode;

                return StatusCode((int)result.responseCode, result.responseMessage.ToString());
            }
            finally { }
        }

        public static string Base64Encode(string plainText)
        {
            var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(plainText);
            return System.Convert.ToBase64String(plainTextBytes);
        }



    }
}
