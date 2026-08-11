namespace Resources;

public class IncomeSupportParameterRepository(DatabaseContext databaseContext, IMapper mapper) : IIncomeSupportParameterRepository
{
    public IncomeSupportParameter Single(BaseIncomeSupportParameterQuery query)
    {
        var entity = BuildQueryable(query)
            .Single();
        return mapper.Map<IncomeSupportParameter>(entity);
    }

    // TODO refactor to use Query method
    // TODO consider decomposing business logic
    public decimal GetCOLA(DateTime effectiveDate, decimal cap)
    {
        var queryResults = databaseContext.Vsd_IncomeSupportParameterSet
            .Where(x => x.Vsd_Type == Vsd_IncomeSupportParameter_Vsd_Type.Cola)
            .Where(x => x.Vsd_EffectiveDate >= effectiveDate.ToUniversalTime().Date)
            .Where(x => x.StateCode == (Vsd_IncomeSupportParameter_StateCode)StateCode.Active)
            .Where(x => x.StatusCode == (Vsd_IncomeSupportParameter_StatusCode)StatusCode.Active)
            .Where(x => x.Vsd_IncomeSupportParameterValidated == Vsd_YesNo.Yes)
            .ToList();

        if (queryResults.Count > 0)
        {
            var colaValue = cap;

            // NOTE this below line would probably work but in an effort to cut corners, use the below code which is a tested version that works
            //return queryResults.Sum(x => (colaValue += colaValue * (decimal)x.Vsd_Value) / 100);

            foreach (var ent in queryResults)
            {
                colaValue = colaValue + ((colaValue * (decimal)ent.Vsd_Value) / 100);
            }
            return colaValue;
        }
        else
        {
            return cap;
        }
    }

    private IQueryable<Vsd_IncomeSupportParameter> BuildQueryable(BaseIncomeSupportParameterQuery query)
    {
        return databaseContext.Vsd_IncomeSupportParameterSet
            .WhereIf(query.Type != null, x => x.Vsd_Type == (Vsd_IncomeSupportParameter_Vsd_Type?)query.Type)
            .WhereIf(query.BeforeEffectiveDate != null, x => x.Vsd_EffectiveDate <= query.BeforeEffectiveDate)
            .WhereIf(query.StateCode != null, x => x.StateCode == (Vsd_IncomeSupportParameter_StateCode?)query.StateCode)
            .WhereIf(query.StatusCode != null, x => x.StatusCode == (Vsd_IncomeSupportParameter_StatusCode?)query.StatusCode)
            .WhereIf(query.Validated != null, x => x.Vsd_IncomeSupportParameterValidated == (Vsd_YesNo?)query.Validated);
    }
}
