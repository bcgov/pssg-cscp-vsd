public class PaymentTests(IMediator mediator, ILoggerFactory loggerFactory)
{
    private readonly ILogger _logger = loggerFactory.CreateLogger<PaymentScheduleTests>();

    [Fact]
    public async Task Send_Invoices_Cas_Transaction()
    {
        //var test = await GenerateCVAPDistributionAccount(new Guid("6baad5a2-7120-eb11-b821-00505683fbf4"));

        var invoices = new CasApTransactionInvoices();
        invoices.IsBlockSupplier = true;
        invoices.InvoiceType = "Standard";
        invoices.SupplierNumber = "2002740";
        invoices.SupplierSiteNumber = 1;
        invoices.InvoiceDate = DateTime.Now;
        invoices.InvoiceNumber = "INV-2021-002446";
        invoices.InvoiceAmount = 1000;
        invoices.PayGroup = "GEN CHQ";
        invoices.DateInvoiceReceived = DateTime.Now;
        invoices.RemittanceCode = "01";
        invoices.SpecialHandling = false;
        invoices.NameLine1 = "Ida Test Albert Test";
        invoices.AddressLine1 = "123 Park Road";
        invoices.City = "Vancouver";
        invoices.Country = "CA";
        invoices.Province = "BC";
        invoices.PostalCode = "T2J2Z2";
        invoices.QualifiedReceiver = "team";
        invoices.Terms = "Immediate";
        invoices.PayAloneFlag = "Y";
        invoices.PaymentAdviceComments = "Test1";
        invoices.RemittanceMessage1 = "Test2";
        invoices.RemittanceMessage2 = "Test3";
        invoices.RemittanceMessage3 = "Test4";
        invoices.GLDate = DateTime.Now;
        invoices.InvoiceBatchName = "SNBATCH";
        invoices.CurrencyCode = "CAD";
        invoices.InvoiceLineDetails = new List<CasApTransactionInvoiceLineDetail>
        {
            new CasApTransactionInvoiceLineDetail
            {
                InvoiceLineNumber = 1,
                InvoiceLineType = "Item",
                LineCode = "DR",
                InvoiceLineAmount = 1000,
                DefaultDistributionAccount = "010.15106.12120.6038.1501300.000000.0000",
            }
        };

        //casHttpClient.Initialize(clientId, clientKey, url);
        //await casHttpClient.ApTransaction(invoices);
    }

    [Fact]
    public async Task Send_Payment_To_CAS()
    {
        var command = new SendPaymentsToCasCommand();
        var isSuccess = await mediator.Send(command);

        Assert.True(isSuccess);
    }
}
