public class PaymentScheduleRepositoryTests(IPaymentScheduleRepository repository)
{
    // WARNING!!! these are not reliable tests, they will fail, these were shortcuts I used for building a POC, these tests will need to be adjusted in order to be idempotent

    [Fact]
    public void Query()
    {
        // Arrange
        var command = new PaymentScheduleEntitlementQuery();
        //command.StateCode = StateCode.Active;
        //command.BeforeStartDate = DateTime.Now.AddYears(-1);
        //command.BeforeNextRunDate = DateTime.Now.AddYears(-1);
        //command.NotNullCaseId = true;
        //command.NotNullPayeeId = true;
        //command.Status = PaymentScheduleStatus.Active;
        //command.IsRecurring = true;
        command.EntitlementQuery = new EntitlementQuery();
        command.EntitlementQuery.StatusCode = EntitlementStatusCode.Requested;

        // Act
        var result = repository.Query(command);

        var test = JsonConvert.SerializeObject(result.First());

        // Assert
        Assert.True(result.Count() > 0);
    }

    // NOTE to find an inactive record to test with https://cscp-vs.dev.jag.gov.bc.ca/api/data/v9.0/vsd_paymentschedules?$filter=statecode eq 1
    // to load the result https://cscp-vs.dev.jag.gov.bc.ca/api/data/v9.0/vsd_paymentschedules?$filter=vsd_paymentscheduleid eq '23fdd752-fbd8-eb11-b828-00505683fbf4'
    [Fact]
    public void Update()
    {
        // Arrange
        var dto = new PaymentSchedule { CaseName = "CaseName", Payee = null! };
        dto.Id = new Guid("23fdd752-fbd8-eb11-b828-00505683fbf4");
        dto.FirstRunDate = new DateTime(2001, 1, 1);
        dto.NextRunDate = new DateTime(2002, 2, 2);
        dto.Frequency = Frequency.Annually;
        dto.XValue = 1;
        dto.ShareValue = 1.01m;
        dto.ShareOptions = ShareOptions.AllocatedToCurrentSchedule_100000001;
        dto.CppDeduction = 1.02m;
        dto.OtherDeduction = 1.03m;
        dto.OverPaymentAmount = 1.04m;
        dto.OverPaymentEmi = 1.05m;
        dto.PercentageDeduction = 1.06m;

        // Act
        var result = repository.Update(dto);

        // Assert
        Assert.True(result);

        //var command = new PaymentScheduleEntitlementQuery();
        //command.Id = new Guid("538734d6-549d-ef11-b853-00505683fbf4");

        //dto = null;
        //dto = repository.Query(command).First();

    }
}
