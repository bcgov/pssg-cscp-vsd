using System.Linq.Expressions;
using AutoMapper.Extensions.ExpressionMapping;

public static class AutoMapperExtensions
{
    public static async Task<TModelResult> Query<TModel, TData, TModelResult, TDataResult>(
        this IQueryable<TData> query,
        IMapper mapper,
        Expression<Func<IQueryable<TModel>, TModelResult>> queryFunc
    )
        where TData : class
    {
        //Map the expressions
        Func<IQueryable<TData>, TDataResult> mappedQueryFunc = mapper
            .MapExpression<Expression<Func<IQueryable<TData>, TDataResult>>>(queryFunc)
            .Compile();

        //execute the query
        return mapper.Map<TDataResult, TModelResult>(mappedQueryFunc(query));
    }

    public static async Task<ICollection<TModel>> GetItemsAsync<TModel, TData>(
        this IQueryable<TData> query,
        IMapper mapper,
        Expression<Func<TModel, bool>> filter = null,
        Expression<Func<IQueryable<TModel>, IQueryable<TModel>>> queryFunc = null //,
    //ICollection<Expression<Func<IQueryable<TModel>, IIncludableQueryable<TModel, object>>>> includeProperties = null
    )
    {
        //Map the expressions
        Expression<Func<TData, bool>> f = mapper.MapExpression<Expression<Func<TData, bool>>>(filter);
        Func<IQueryable<TData>, IQueryable<TData>> mappedQueryFunc = mapper
            .MapExpression<Expression<Func<IQueryable<TData>, IQueryable<TData>>>>(queryFunc)
            ?.Compile();
        //ICollection<Expression<Func<IQueryable<TData>, IIncludableQueryable<TData, object>>>> includes = mapper.MapIncludesList<Expression<Func<IQueryable<TData>, IIncludableQueryable<TData, object>>>>(includeProperties);

        if (f != null)
            query = query.Where(f);

        //if (includes != null)
        //    query = includes.Select(i => i.Compile()).Aggregate(query, (list, next) => query = next(query));

        //Call the store
        ICollection<TData> result = mappedQueryFunc != null ? mappedQueryFunc(query).ToList() : query.ToList();

        //Map and return the data
        return mapper.Map<IEnumerable<TData>, IEnumerable<TModel>>(result).ToList();
    }
}
