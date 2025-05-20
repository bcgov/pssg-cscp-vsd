using System.Threading.Tasks;
using Manager.Contract;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Gov.Cscp.VictimServices.Public.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly ILogger _logger;
        private readonly IMediator _mediator;

        public PaymentController(ILoggerFactory loggerFactory, IMediator mediator)
        {
            _logger = loggerFactory.CreateLogger<PaymentController>();
            _mediator = mediator;
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendPaymentsToCas()
        {
            var command = new SendPaymentsToCasCommand();
            var isSuccessful = await _mediator.Send(command);
            return Ok(isSuccessful);
        }
    }
}
