using System.Threading.Tasks;
using Manager.Contract;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Gov.Cscp.VictimServices.Public.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentScheduleController : ControllerBase
    {
        private readonly ILogger _logger;
        private readonly IMediator _mediator;

        public PaymentScheduleController(ILoggerFactory loggerFactory, IMediator mediator)
        {
            _logger = loggerFactory.CreateLogger<PaymentScheduleController>();
            _mediator = mediator;
        }

        [HttpPost("schedule-cvap")]
        public async Task<IActionResult> ScheduleCvapPayments()
        {
            var command = new ScheduleCvapPaymentsCommand();
            var isSuccessful = await _mediator.Send(command);
            return Ok(isSuccessful);
        }
    }
}
