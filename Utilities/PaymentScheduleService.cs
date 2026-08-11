namespace Utilities;

// TODO should this file be moved to Resources project?
// TODO replace Money with decimal
public interface IPaymentScheduleService
{
    PaymentTotalResult GetPaymentTotal(PaymentSchedule paymentSchedule, Entitlement entitlement, decimal minimumWage);
    Tuple<Money, decimal> GetDollarAmounts(PaymentSchedule paymentSchedule, Entitlement entitlement, decimal minimumWage);
    DateTime GetNextRuntime(PaymentSchedule paymentSchedule);
    Task<bool> ScheduleCvapPayments();
}

// TODO Utilities doesn't feel like the right place for this
public class PaymentScheduleService(
    IMediator mediator, IMessageRequests messageRequests, IPaymentScheduleRepository paymentScheduleRepository, IProvinceRepository provinceRepository,
    IIncomeSupportParameterRepository incomeSupportParameterRepository, IConfiguration configuration, ILoggerFactory loggerFactory) : IPaymentScheduleService
{
    private readonly ILogger _logger = loggerFactory.CreateLogger<PaymentScheduleService>();

    public async Task<bool> ScheduleCvapPayments()
    {
        _logger.LogInformation("Starting to schedule CVAP payments.");

        // NOTE this will probably be handled in Dynamics before the service is called
        //messageRequests.SetState(Vsd_ScheduledJob.EntityLogicalName, Id, StateCode.Active, ScheduledJobStatusCode.InProgress);

        var cadCurrencyCommand = new GetCurrencyLookupCommand();
        var cadCurrency = await mediator.Send(cadCurrencyCommand);

        var teamQuery = new SingleTeamQuery();
        teamQuery.Name = "CVAP Administrative Team";
        teamQuery.TeamType = TeamType.Owner;
        var adminTeam = await mediator.Send(teamQuery);
        if (adminTeam == null)
        {
            throw new Exception("CVAP Admin Team not found.");
        }

        _logger.LogInformation($"Found CVAP Administrative Team {adminTeam.Id}.");

        var incomeSupportParameterQuery = new SingleIncomeSupportParameterQuery();
        incomeSupportParameterQuery.Type = IncomeSupportParameterType.MinimumWage;
        incomeSupportParameterQuery.BeforeEffectiveDate = DateTime.UtcNow.Date;
        incomeSupportParameterQuery.StateCode = StateCode.Active;
        incomeSupportParameterQuery.StatusCode = IncomeSupportParameterStatusCode.Active;
        incomeSupportParameterQuery.Validated = YesNo.Yes;
        var minimumWage = await mediator.Send(incomeSupportParameterQuery);

        _logger.LogInformation($"Minimum wage {minimumWage.Value}.");

        var paymentScheduleQuery = new PaymentScheduleEntitlementQuery();
        paymentScheduleQuery.PaymentScheduleQuery = new PaymentScheduleQuery();
        paymentScheduleQuery.PaymentScheduleQuery.StateCode = StateCode.Active;
        paymentScheduleQuery.PaymentScheduleQuery.BeforeStartDate = DateTime.UtcNow;
        paymentScheduleQuery.PaymentScheduleQuery.BeforeNextRunDate = DateTime.UtcNow;
        paymentScheduleQuery.PaymentScheduleQuery.NotNullCaseId = true;
        paymentScheduleQuery.PaymentScheduleQuery.NotNullPayeeId = true;
        paymentScheduleQuery.EntitlementQuery = new EntitlementQuery();
        paymentScheduleQuery.EntitlementQuery.StatusCode = EntitlementStatusCode.Approved;
        paymentScheduleQuery.EntitlementQuery.PaymentScheduleStatus = PaymentScheduleStatus.Active;
        paymentScheduleQuery.EntitlementQuery.IsRecurring = true;
        var paymentScheduleEntitlements = await mediator.Send(paymentScheduleQuery);

        if (paymentScheduleEntitlements != null && paymentScheduleEntitlements.Any())
        {
            _logger.LogInformation($"Found {paymentScheduleEntitlements.Count()} payment schedules.");
        }
        else
        {
            _logger.LogInformation($"No payment schedules found.");
        }

        foreach (var paymentScheduleEntitlement in paymentScheduleEntitlements)
        {
            var paymentSchedule = paymentScheduleEntitlement.PaymentSchedule;
            var entitlement = paymentScheduleEntitlement.Entitlement;

            _logger.LogInformation($"Processing payment schedule {paymentSchedule.Id}.");

            if (paymentSchedule.NextRunDate == null)
                continue;
            var oldRunTime = paymentSchedule.NextRunDate.Value.ToUniversalTime(); //OnOrBefore operator doesn't look at time and only looks at date. UTC-explicit: DST-safe.
            if (oldRunTime > DateTime.UtcNow)
                continue;

            if (entitlement.SetCap == null)
                continue;

            if (paymentSchedule.EndDate != null)
            {
                var endDate = paymentSchedule.EndDate.Value.ToUniversalTime();
                if (endDate < DateTime.UtcNow)
                {
                    // update entitlement to have payment schedule status "Inactive" (Cancelled)
                    _logger.LogInformation(string.Format("Updating Payment Schedule Status to Inactive for '{0}'..", entitlement.Id));
                    var updatePaymentStatusCommand = new UpdatePaymentScheduleStatus(entitlement.Id, PaymentScheduleStatus.Cancelled);
                    await mediator.Send(updatePaymentStatusCommand);

                    messageRequests.SetState(Vsd_PaymentSchedule.EntityLogicalName, paymentScheduleEntitlement.PaymentSchedule.Id, 1, 2);
                }
            }

            #region Create Invoice & Payment

            var invoice = new Invoice() { Owner = new DynamicReference(adminTeam.Id, Database.Model.Team.EntityLogicalName) };
            invoice.Id = Guid.NewGuid();
            invoice.Origin = Origin.AutoGenerated;
            invoice.CvapInvoiceType = InvoiceType.OtherPayments;
            invoice.InvoiceDate = DateTime.UtcNow;
            invoice.Payee = paymentSchedule.Payee;
            invoice.CaseId = paymentSchedule.CaseId;
            invoice.Owner = new DynamicReference(adminTeam.Id, Database.Model.Team.EntityLogicalName);
            invoice.EntitlementId = paymentSchedule.EntitlementId;
            invoice.CvapAuthorizationStatus = CvapAuthorizationStatus.ApprovedByQr;
            invoice.AuthorizationDate = DateTime.UtcNow;
            invoice.ProgramUnit = ProgramUnit.Cvap;
            invoice.CurrencyId = cadCurrency.Id;
            invoice.CvapPaymentType = CvapPaymentType.PostAdjudication; // 100000001
            invoice.StatusCode = InvoiceStatusCode.Submitted;
            invoice.MethodOfPayment = MethodOfPayment.Cheque;
            invoice.CvapNumberOfLineItems = CvapNumberOfLineItems._1; //100000000 //1
            invoice.CvapStobId = Constant.CvapStobId; //7902 - Entitlements
            invoice.ProcessId = Guid.Empty;
            invoice.ProvinceStateId = Constant.ProvinceBc;
            invoice.PaymentScheduleId = paymentSchedule.Id;
            invoice.CpuInvoiceType = CpuInvoiceType.ScheduledPayment;
            // TODO
            // "vsd_cvap_numberoflineitems": 100000000
            // "vsd_authorizationdate": "2024-11-29T11:03:35Z",
            if (entitlement.TaxExemptFlag ?? false)
                invoice.TaxExemption = TaxExemption.NoTax;
            else
                invoice.TaxExemption = TaxExemption.GstOnly;
            _logger.LogInformation($"Entering into Invoice creation {JsonConvert.SerializeObject(invoice)}.");

            var getPaymentTotalCommand = new GetPaymentTotalCommand
            {
                PaymentSchedule = paymentSchedule,
                Entitlement = entitlement
            };
            getPaymentTotalCommand.MinimumWage = minimumWage.Value;
            var paymentAmounts = await mediator.Send(getPaymentTotalCommand);

            var payment = new Payment() { Owner = null };
            payment.Date = DateTime.UtcNow;
            if (entitlement.TaxExemptFlag ?? false)
            {
                payment.SubTotal = paymentAmounts.Amount;
                payment.Total = payment.SubTotal;
            }
            else
            {
                var bcProvinceQuery = new FindProvinceQuery();
                bcProvinceQuery.Id = Constant.ProvinceBc;
                var bcProvince = await mediator.Send(bcProvinceQuery);
                ArgumentNullException.ThrowIfNull(bcProvince.TaxRate);

                payment.SubTotal = paymentAmounts.Amount;
                payment.Gst = (decimal)payment.SubTotal * (decimal)bcProvince.TaxRate;
                payment.Total = (decimal)payment.SubTotal + payment.Gst;
            }

            payment.GlDate = DateTime.UtcNow;
            payment.Terms = PaymentTerms.Immediate;
            payment.CaseId = paymentSchedule.CaseId;
            payment.EntitlementId = paymentSchedule.EntitlementId;
            //paymentEntity["ownerid"] = adminTeam;
            payment.Payee = invoice.Payee;
            payment.TransactionCurrencyId = cadCurrency.Id;
            payment.EftAdvice = EftAdvice.Mail;

            //VS-5752
            payment.RemittanceMessage1 = paymentSchedule.CaseName;
            // TODO
            payment.RemittanceMessage2 = invoice.EntitlementName;   // e.g. "Income Support-Long term-Minimum Wage"
            payment.RemittanceMessage3 = "Crime Victim Assistance Program";
            _logger.LogInformation($"Payment created {JsonConvert.SerializeObject(payment)}.");

            //****Add Line Item
            var invoiceLineDetail = new InvoiceLineDetail()
            {
                Owner = invoice.Owner
            };
            invoiceLineDetail.Id = Guid.NewGuid();
            invoiceLineDetail.CaseId = invoice.CaseId;
            invoiceLineDetail.EntitlementId = invoice.EntitlementId;
            invoiceLineDetail.InvoiceId = invoice.Id;
            invoiceLineDetail.AmountSimple = payment.SubTotal;
            invoiceLineDetail.InvoiceType = InvoiceType.OtherPayments;
            invoiceLineDetail.Approved = YesNo.Yes;
            invoiceLineDetail.ProvinceStateId = Constant.ProvinceBc;
            invoiceLineDetail.TaxExemption = invoice.TaxExemption;
            invoiceLineDetail.ProgramUnit = ProgramUnit.Cvap;
            invoiceLineDetail.CurrencyId = cadCurrency.Id;
            invoice.InvoiceLineDetails = new List<InvoiceLineDetail> { invoiceLineDetail };
            _logger.LogInformation($"Invoice Line Details created {JsonConvert.SerializeObject(invoiceLineDetail)}.");

            payment.Invoices = new List<Invoice>() { invoice };

            if (configuration["TEST_SCHEDULED_JOBS_ENABLED"] == null)
            {
                var insertPaymentCommand = new InsertCommand<Payment>(payment);
                payment.Id = await mediator.Send(insertPaymentCommand);
            }

            // TODO try adding payment before invoice and then no update required
            invoice.PaymentId = payment.Id;

            #endregion

            #region Update Next Run Time
            //****Check for weekdays
            var getNextRuntimeCommand = new GetNextRuntimeCommand
            {
                PaymentSchedule = paymentSchedule
            };
            var nextRunDate = await mediator.Send(getNextRuntimeCommand);
            _logger.LogInformation($"Next Run Date {nextRunDate}.");

            bool deactivateNextRun = false;
            if (paymentSchedule.EndDate != null)
            {
                var endDate = ((DateTime)paymentSchedule.EndDate).ToUniversalTime();
                if (endDate <= nextRunDate)
                {
                    _logger.LogInformation("Deactivating payment schedule due to end date is earlier than next run date");
                    deactivateNextRun = true;   //VS-6245: if enddate is earlier or equals to next run date then deactivate the schedule 
                                                //  continue;   //removed due to VS-6245
                }
            }

            _logger.LogInformation("Updating the Next Run Date and total income support amount..");
            //var updatePaymentSchedule = new PaymentSchedule();
            //updatePaymentSchedule.Id = paymentSchedule.Id;
            if (paymentSchedule.FirstRunDate == null)
                paymentSchedule.FirstRunDate = paymentSchedule.NextRunDate;
            paymentSchedule.TotalAmountOfIncomeSupport = paymentAmounts.Amount;

            if (deactivateNextRun == true)    //VS-6245
            {
                paymentSchedule.StateCode = StateCode.Inactive;
                paymentSchedule.StatusCode = PaymentScheduleStatusCode.Inactive;
            }
            else
            {
                paymentSchedule.NextRunDate = nextRunDate;
            }

            paymentSchedule.ActualValue = paymentAmounts.ActualAmount;

            //Added new logic//VS-4531.
            if (paymentSchedule.OverPaymentEmi != null && paymentSchedule.OverPaymentAmount != null)
            {
                var overPayment = paymentSchedule.OverPaymentAmount;
                var emi = paymentSchedule.OverPaymentEmi;

                if ((overPayment - emi) >= 0)
                {
                    paymentSchedule.RemainingPaymentAmount = overPayment - emi;
                }
                else if ((overPayment - emi) < 0)
                {
                    paymentSchedule.RemainingPaymentAmount = 0;
                }
            }

            if (configuration["TEST_SCHEDULED_JOBS_ENABLED"] == null)
            {
                var updatePaymentScheduleCommand = new UpdateCommand<PaymentSchedule>(paymentSchedule);
                await mediator.Send(updatePaymentScheduleCommand);
            }

            #endregion
        }

        return true;
    }

    public PaymentTotalResult GetPaymentTotal(PaymentSchedule paymentSchedule, Entitlement entitlement, decimal minimumWage)
    {
        Money amount = new Money();
        Money actualAmount = new Money();

        if (paymentSchedule.PrimaryScheduleId != null)
        {
            var primaryScheduleQuery = new PaymentScheduleQuery { Id = paymentSchedule.PrimaryScheduleId };
            // TODO should be using mediator
            var primarySchedule = paymentScheduleRepository.FirstOrDefault(primaryScheduleQuery);

            var primaryAmounts = GetDollarAmounts(primarySchedule, entitlement, minimumWage);

            if (paymentSchedule.ShareOptions != null)
            {
                if (paymentSchedule.ShareOptions == ShareOptions.AllocatedToCurrentSchedule_100000001) //% Share
                {
                    if (paymentSchedule.ShareValue != null)
                    {
                        var shareValue = (decimal)paymentSchedule.ShareValue;
                        amount = new Money(primaryAmounts.Item2 * (shareValue / 100));
                        actualAmount = new Money(amount.Value);

                        var primaryFrequency = primarySchedule.Frequency;
                        var childFrequency = primarySchedule.Frequency;

                        var primaryXValue = (int)primarySchedule.XValue;
                        var childXValue = (int)paymentSchedule.XValue;

                        amount = new Money(amount.Value / primaryXValue);
                        actualAmount = new Money(actualAmount.Value / primaryXValue);

                        if (primaryFrequency == Frequency.Annually) //Annual
                        {
                            amount = new Money((amount.Value / 12) * childXValue);
                            actualAmount = new Money((actualAmount.Value / 12) * childXValue);
                        }
                        else if (primaryFrequency == Frequency.Monthly) //Monthly
                        {
                            amount = new Money(amount.Value * childXValue);
                            actualAmount = new Money(actualAmount.Value * childXValue);
                        }
                        else if (primaryFrequency == Frequency.Weekly) //Weekly
                        {
                            amount = new Money(((amount.Value * 52) / 12) * childXValue);
                            actualAmount = new Money(((actualAmount.Value * 52) / 12) * childXValue);
                        }
                        else if (primaryFrequency == Frequency.Daily) //Daily
                        {
                            amount = new Money(((amount.Value * 365) / 12) * childXValue);
                            actualAmount = new Money(((actualAmount.Value * 365) / 12) * childXValue);
                        }
                    }
                    else
                        throw new Exception("Share Value is missing.");
                }
                else if (paymentSchedule.ShareOptions == ShareOptions.AllocatedToCurrentSchedule_100000002) //$ Share
                {
                    if (paymentSchedule.ShareValue != null)
                    {
                        actualAmount = new Money((decimal)paymentSchedule.ShareValue);
                        amount = actualAmount;
                    }
                    else
                        throw new Exception("Share Value is missing.");
                }
            }
        }
        else
        {
            var amounts = GetDollarAmounts(paymentSchedule, entitlement, minimumWage);
            amount = amounts.Item1;
            actualAmount = new Money(amounts.Item2);
        }

        if (!(entitlement.TaxExemptFlag ?? false)) //GST
        {
            var bcProvinceQuery = new FindProvinceQuery();
            bcProvinceQuery.Id = Constant.ProvinceBc;
            // TODO use mediator instead of repository
            var bcProvince = provinceRepository.FirstOrDefault(bcProvinceQuery);
            ArgumentNullException.ThrowIfNull(bcProvince.TaxRate);

            amount = new Money(amount.Value + (amount.Value * (decimal)bcProvince.TaxRate));
            actualAmount = new Money(actualAmount.Value + (actualAmount.Value * (decimal)bcProvince.TaxRate));
        }

        return new PaymentTotalResult(amount.Value, actualAmount.Value);
    }

    public Tuple<Money, decimal> GetDollarAmounts(PaymentSchedule paymentSchedule, Entitlement entitlement, decimal minimumWage)
    {
        var amount = new Money(0);
        decimal actualAmount = 0;

        if (paymentSchedule.Frequency == null)
        {
            throw new Exception("Frequency is missing.");
        }
        if (paymentSchedule.XValue == null)
        {
            throw new Exception("Recurrence Value Within Frequency is missing.");
        }

        if (entitlement.BenefitTypeId == null)
        {
            throw new Exception("Benefit Type is missing.");
        }
        if (entitlement.SetCap == null)
        {
            throw new Exception("Set Cap is missing.");
        }

        //var benefitCategory = entitlement["vsd_benefitcategoryid"] as EntityReference;
        //var benefitType = entitlement["vsd_benefittypeid"] as EntityReference;
        var setCap = (decimal)entitlement.SetCap;

        if (entitlement.BenefitTypeId.Equals(new Guid("16127869-ec45-e911-a987-000d3af49373"))) //Child 1
        {
            minimumWage = (15 * minimumWage) / 100;
        }
        else if (entitlement.BenefitTypeId.Equals(new Guid("665326a4-0500-ea11-b812-00505683fbf4"))) //Child 2+
        {
            minimumWage = (10 * minimumWage) / 100;
        }
        else if (entitlement.BenefitTypeId.Equals(new Guid("6f54cf3b-8150-eb11-b822-00505683fbf4"))) //Financially Dependent IFM
        {
            if (entitlement.FinanciallyDependentIfmWage == null)
            {
                throw new Exception("Financially Dependent IFM Wage % is missing.");
            }

            minimumWage = ((decimal)entitlement.FinanciallyDependentIfmWage * minimumWage) / 100;
        }
        else if (entitlement.BenefitTypeId.Equals(new Guid("6c16896c-ec45-e911-a97d-000d3af49211"))) //Spouse
        {
            minimumWage = (75 * minimumWage) / 100;
        }

        if (entitlement.BenefitSubTypeId != null)
        {
            //var benefitSubType = entitlement["vsd_benefitsubtypeid"] as EntityReference;
            if (entitlement.BenefitSubTypeName != null && entitlement.BenefitSubTypeName.Equals("Minimum Wage", StringComparison.InvariantCultureIgnoreCase))
            {
                var result1 = (setCap * minimumWage * 52) / 12;

                if (paymentSchedule.PercentageDeduction != null)
                {
                    var deductionAmount = result1 * ((decimal)paymentSchedule.PercentageDeduction / 100);
                    result1 = result1 - deductionAmount;
                }

                actualAmount = result1;

                if (paymentSchedule.ShareOptions != null)
                {
                    if (paymentSchedule.ShareOptions == ShareOptions.AllocatedToCurrentSchedule_100000001) //% Share
                    {
                        if (paymentSchedule.ShareValue != null)
                        {
                            var shareValue = (decimal)paymentSchedule.ShareValue;
                            result1 = result1 * (shareValue / 100);
                        }
                        else
                            throw new Exception("Share Value is missing.");
                    }
                    else if (paymentSchedule.ShareOptions == ShareOptions.AllocatedToCurrentSchedule_100000002) //$ Share
                    {
                        if (paymentSchedule.ShareValue != null)
                        {
                            var shareValue = (decimal)paymentSchedule.ShareValue;
                            result1 = shareValue;
                        }
                        else
                            throw new Exception("Share Value is missing.");
                    }
                }

                if (paymentSchedule.CppDeduction != null)
                {
                    result1 = result1 - (decimal)paymentSchedule.CppDeduction;
                }

                if (paymentSchedule.OtherDeduction != null)
                {
                    result1 = result1 - (decimal)paymentSchedule.OtherDeduction;
                }

                if (paymentSchedule.OverPaymentEmi != null && paymentSchedule.OverPaymentAmount != null)
                {
                    var emi = (decimal)paymentSchedule.OverPaymentEmi;

                    if ((paymentSchedule.OverPaymentAmount - emi) >= 0)
                    {
                        result1 = result1 - emi;
                    }
                }

                if (paymentSchedule.Frequency == Frequency.Monthly) //Monthly
                {
                    var xValue = (int)paymentSchedule.XValue;
                    result1 = result1 * xValue;
                    actualAmount = actualAmount * xValue;
                }
                else if (paymentSchedule.Frequency == Frequency.Weekly) //Weekly
                {
                    result1 = ((result1 * 12) / 52);
                    actualAmount = ((actualAmount * 12) / 52);
                    var xValue = (int)paymentSchedule.XValue;
                    result1 = result1 * xValue;
                    actualAmount = actualAmount * xValue;
                }
                else if (paymentSchedule.Frequency == Frequency.Daily) //Daily
                {
                    result1 = ((result1 * 12) / 365);
                    actualAmount = ((actualAmount * 12) / 365);
                    var xValue = (int)paymentSchedule.XValue;
                    result1 = result1 * xValue;
                    actualAmount = actualAmount * xValue;
                }
                else if (paymentSchedule.Frequency == Frequency.Annually) //Annual
                {
                    result1 = result1 * 12;
                    actualAmount = actualAmount * 12;
                    var xValue = (int)paymentSchedule.XValue;
                    result1 = result1 * xValue;
                    actualAmount = actualAmount * xValue;
                }

                amount = new Money(result1);
            }
            else if (entitlement.BenefitSubTypeName != null && entitlement.BenefitSubTypeName.Equals("COLA", StringComparison.InvariantCultureIgnoreCase))
            {
                if (entitlement.EffectiveDate == DateTime.MinValue)
                {
                    throw new Exception("COLA Effective Date is missing.");
                }

                // TODO use mediator instead of repository
                var result1 = incomeSupportParameterRepository.GetCOLA(entitlement.EffectiveDate, setCap);

                if (paymentSchedule.PercentageDeduction != null)
                {
                    var deductionAmount = result1 * ((decimal)paymentSchedule.PercentageDeduction / 100);
                    result1 = result1 - deductionAmount;
                }

                actualAmount = result1;

                if (paymentSchedule.ShareOptions != null)
                {
                    if (paymentSchedule.ShareOptions == ShareOptions.AllocatedToCurrentSchedule_100000001) //% Share
                    {
                        if (paymentSchedule.ShareValue != null)
                        {
                            var shareValue = (decimal)paymentSchedule.ShareValue;
                            result1 = result1 * (shareValue / 100);
                        }
                        else
                            throw new Exception("Share Value is missing.");
                    }
                    else if (paymentSchedule.ShareOptions == ShareOptions.AllocatedToCurrentSchedule_100000002) //$ Share
                    {
                        if (paymentSchedule.ShareValue != null)
                        {
                            var shareValue = (decimal)paymentSchedule.ShareValue;
                            result1 = shareValue;
                        }
                        else
                            throw new Exception("Share Value is missing.");
                    }
                }

                if (paymentSchedule.CppDeduction != null)
                {
                    result1 = result1 - (decimal)paymentSchedule.CppDeduction;
                }

                if (paymentSchedule.OtherDeduction != null)
                {
                    result1 = result1 - (decimal)paymentSchedule.OtherDeduction;
                }

                if (paymentSchedule.OverPaymentEmi != null && paymentSchedule.OverPaymentAmount != null)
                {
                    var overPayment = (decimal)paymentSchedule.OverPaymentAmount;
                    var emi = (decimal)paymentSchedule.OverPaymentEmi;

                    if ((overPayment - emi) >= 0)
                    {
                        result1 = result1 - emi;
                    }
                }

                if (paymentSchedule.Frequency == Frequency.Monthly) //Monthly
                {
                    var xValue = (int)paymentSchedule.XValue;
                    result1 = result1 * xValue;
                    actualAmount = actualAmount * xValue;
                }
                else if (paymentSchedule.Frequency == Frequency.Weekly) //Weekly
                {
                    var xValue = (int)paymentSchedule.XValue;
                    result1 = result1 * xValue;
                    actualAmount = actualAmount * xValue;
                }
                else if (paymentSchedule.Frequency == Frequency.Daily) //Daily
                {
                    var xValue = (int)paymentSchedule.XValue;
                    result1 = result1 * xValue;
                    actualAmount = actualAmount * xValue;
                }
                else if (paymentSchedule.Frequency == Frequency.Annually) //Annual
                {
                    var xValue = (int)paymentSchedule.XValue;
                    result1 = result1 * xValue;
                    actualAmount = actualAmount * xValue;
                }

                amount = new Money(result1);
            }
            else
            {
                actualAmount = setCap;

                if (paymentSchedule.ShareOptions != null)
                {
                    if (paymentSchedule.ShareOptions == ShareOptions.AllocatedToCurrentSchedule_100000001) //% Share
                    {
                        if (paymentSchedule.ShareValue != null)
                        {
                            var shareValue = (decimal)paymentSchedule.ShareValue;

                            amount = new Money(setCap * (shareValue / 100));
                        }
                        else
                            throw new Exception("Share Value is missing.");
                    }
                    else if (paymentSchedule.ShareOptions == ShareOptions.AllocatedToCurrentSchedule_100000002) //$ Share
                    {
                        if (paymentSchedule.ShareValue != null)
                        {
                            var shareValue = (decimal)paymentSchedule.ShareValue;

                            amount = new Money(shareValue);
                        }
                        else
                            throw new Exception("Share Value is missing.");
                    }
                    else
                        amount = new Money(setCap);
                }
                else
                    amount = new Money(setCap);
            }
        }
        else
        {
            actualAmount = setCap;

            if (paymentSchedule.ShareOptions != null)
            {
                if (paymentSchedule.ShareOptions == ShareOptions.AllocatedToCurrentSchedule_100000001) //% Share
                {
                    if (paymentSchedule.ShareValue != null)
                    {
                        var shareValue = (decimal)paymentSchedule.ShareValue;

                        amount = new Money(setCap * (shareValue / 100));
                    }
                    else
                        throw new Exception("Share Value is missing.");
                }
                else if (paymentSchedule.ShareOptions == ShareOptions.AllocatedToCurrentSchedule_100000002) //$ Share
                {
                    if (paymentSchedule.ShareValue != null)
                    {
                        var shareValue = (decimal)paymentSchedule.ShareValue;

                        amount = new Money(shareValue);
                    }
                    else
                        throw new Exception("Share Value is missing.");
                }
                else
                    amount = new Money(setCap);
            }
            else
                amount = new Money(setCap);
        }

        return new Tuple<Money, decimal>(amount, actualAmount);
    }

    public DateTime GetNextRuntime(PaymentSchedule paymentSchedule)
    {
        var result = ((DateTime)paymentSchedule.NextRunDate).ToUniversalTime();
        if (paymentSchedule.FirstRunDate != null)
            result = ((DateTime)paymentSchedule.FirstRunDate).ToUniversalTime();

        if (paymentSchedule.Frequency == Frequency.Weekly) //Weekly
        {
            do
            {
                var xValue = (int)paymentSchedule.XValue;
                result = result.AddDays(7 * xValue);
            } while (result < DateTime.UtcNow);

            if (result.Day == DateTime.UtcNow.Day && result.Month == DateTime.UtcNow.Month && result.Year == DateTime.UtcNow.Year)
            {
                var xValue = (int)paymentSchedule.XValue;
                result = result.AddDays(7 * xValue);
            }
        }
        else if (paymentSchedule.Frequency == Frequency.Daily) //Daily
        {
            do
            {
                var xValue = (int)paymentSchedule.XValue;
                result = result.AddDays(xValue);
            } while (result < DateTime.UtcNow);

            if (result.Day == DateTime.UtcNow.Day && result.Month == DateTime.UtcNow.Month && result.Year == DateTime.UtcNow.Year)
            {
                var xValue = (int)paymentSchedule.XValue;
                result = result.AddDays(xValue);
            }
        }
        else if (paymentSchedule.Frequency == Frequency.Annually) //Annually
        {
            do
            {
                var xValue = (int)paymentSchedule.XValue;
                result = result.AddYears(xValue);
            } while (result < DateTime.UtcNow);

            if (result.Year == DateTime.UtcNow.Year)
            {
                var xValue = (int)paymentSchedule.XValue;
                result = result.AddYears(xValue);
            }
        }
        else //Monthly
        {
            do
            {
                var xValue = (int)paymentSchedule.XValue;
                result = result.AddMonths(xValue);
            } while (result < DateTime.UtcNow);

            if (result.Month == DateTime.UtcNow.Month)
            {
                var xValue = (int)paymentSchedule.XValue;
                result = result.AddMonths(xValue);
            }

            if ((result.Month == 2 || result.Month == 12) && result.Day >= 20) //Short Months and date to the end of the month VS-2170
            {
                //result = result.AddDays(15 - result.Day);
                result = new DateTime(result.Year, result.Month, 15);
            }
        }

        if (result.DayOfWeek == DayOfWeek.Saturday)
            result = result.AddDays(-1);
        else if (result.DayOfWeek == DayOfWeek.Sunday)
            result = result.AddDays(-2);
        return result;
    }
}
