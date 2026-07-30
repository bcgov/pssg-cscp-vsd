using AutoMapper;

public class PaymentScheduleMapperTests(IMapper mapper)
{
    [Fact]
    public void Dto_To_Entity()
    {
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

        var entity = mapper.Map<Vsd_PaymentSchedule>(dto);

        Assert.Equal(dto.Id, entity.Id);
        Assert.Equal(dto.FirstRunDate, entity.Vsd_FirstRunDate);
        Assert.Equal(dto.NextRunDate, entity.Vsd_NextRUndate);
        Assert.Equal(dto.Frequency, (Frequency)entity.Vsd_Frequency!);
        Assert.Equal(dto.XValue, entity.Vsd_XValue);
        Assert.Equal(dto.ShareValue, entity.Vsd_ShareValue);
        Assert.Equal(dto.ShareOptions, (ShareOptions)entity.Vsd_ShareOptions!);
        Assert.Equal(dto.CppDeduction, entity.Vsd_CPpDeduction.Value);
        Assert.Equal(dto.OtherDeduction, entity.Vsd_OtherDeduction.Value);
        Assert.Equal(dto.OverPaymentAmount, entity.Vsd_OverpaymentAmount.Value);
        Assert.Equal(dto.OverPaymentEmi, entity.Vsd_OverpayMenteMi.Value);
        Assert.Equal(dto.PercentageDeduction, entity.Vsd_PercentagedEduction);
    }
}
