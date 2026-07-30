public class PaymentScheduleTests(IMediator mediator, ILoggerFactory loggerFactory)
{
    private readonly ILogger _logger = loggerFactory.CreateLogger<PaymentScheduleTests>();

    // NOTE not a practical integration test, used to speed up the development of PaymentController.SchedulePayment service
    [Fact]
    public async Task Schedule_Payment()
    {
        var command = new ScheduleCvapPaymentsCommand();
        var isSuccess = await mediator.Send(command);

        Assert.True(isSuccess);
    }
}
