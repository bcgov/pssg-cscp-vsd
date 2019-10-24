using Microsoft.AspNetCore.Mvc;

namespace Gov.Cscp.VictimServices.Public.Controllers
{
    [Route("404")]
    public class NotFoundController : Controller
    {
        public NotFoundController()
        {
        }

        [HttpGet]
        public ActionResult NotFound(string path)
        {
            return NotFound();
        }
    }
}
