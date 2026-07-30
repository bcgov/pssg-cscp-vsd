public class PaymentRepositoryTests(IPaymentRepository paymentRepository)
{
    [Fact]
    public void Insert()
    {
        var payment = new Payment() { Owner = TestData.Owner };
        payment.Date = new DateTime(2024, 1, 1);
        payment.SubTotal = 2.22m;
        payment.Total = 3.33m;
        payment.Gst = 0.11m;
        payment.GlDate = new DateTime(2024, 1, 1);
        payment.Terms = PaymentTerms._20Days;
        payment.EftAdvice = EftAdvice.Email;
        payment.RemittanceMessage1 = "RemittanceMessage1";
        payment.RemittanceMessage2 = "RemittanceMessage2";
        payment.RemittanceMessage3 = "RemittanceMessage3";

        payment.Id = paymentRepository.Insert(payment);
        Assert.True(payment.Id != Guid.Empty);
    }

    [Fact]
    public void First()
    {
        // Arrange
        var query = new FindPaymentQuery();
        query.Id = new Guid("");

        // Act
        var result = paymentRepository.FirstOrDefault(query);

        // Assert
        Assert.True(result!.Invoices!.Count() > 0);
    }

    [Fact]
    public void Query()
    {
        // Arrange
        var paymentQuery = new PaymentQuery();
        paymentQuery.IncludeChildren = true;
        paymentQuery.StateCode = StateCode.Active;
        //paymentQuery.StatusCode = PaymentStatusCode.Sent;
        paymentQuery.ExcludeStatusCodes = new List<PaymentStatusCode> { PaymentStatusCode.Voided, PaymentStatusCode.Paid, PaymentStatusCode.Waiting, PaymentStatusCode.Sending, PaymentStatusCode.Sent };

        // Act
        var result = paymentRepository.Query(paymentQuery);

        // Assert
        Assert.True(result.Count() > 0);
    }
}
