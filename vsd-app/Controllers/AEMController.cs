using Gov.Cscp.VictimServices.Public.Models;
using Gov.Cscp.VictimServices.Public.Services;
using Gov.Cscp.VictimServices.Public.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Threading.Tasks;
using System.Xml.Linq;
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

        [HttpPost("getPDF")]
        //[FromBody] AEMInterfaceModel model
        public async Task<IActionResult> GetPDF([FromBody] ApplicationFormModel model)
        {
            try
            {
                string objString = JsonConvert.SerializeObject(model);
                XNode node = JsonConvert.DeserializeXNode(objString, "root", true, true);
                string xml = node.ToString();
                xml = xml.Replace("\\r\\n", "");
                xml = "<?xml version = '1.0' encoding = 'ISO-8859-1'?>" + xml;

                string aem_app = "coast-cva";
                string aem_form = "CVAP0001";
                string document_format = "pdfa";

                string requestJson = "{\"aem_app\":\"" + aem_app + "\"," +
                "\"aem_form\":\"" + aem_form + "\"" +
                "\"document_format\":\"" + document_format + "\"" +
                "\"aem_xml_data\":\"" + xml + "\"" +
                "}";

                XmlSerializer xsSubmit = new XmlSerializer(typeof(ApplicationFormModel));

                string xml2 = "";
                var encoding = Encoding.GetEncoding("ISO-8859-1");



                using (var sww = new StringWriter())
                {
                    XmlWriterSettings settings = new XmlWriterSettings();
                    settings.Encoding = Encoding.GetEncoding("ISO-8859-1");

                    using (XmlWriter writer = XmlWriter.Create(sww, settings))
                    {
                        xsSubmit.Serialize(writer, model);
                        xml2 = sww.ToString();
                    }
                }


                AEMResult result = await _aemResultService.Post(requestJson);

                return StatusCode((int)result.responseCode, result.ToString());
            }
            finally { }
        }


    }
}
