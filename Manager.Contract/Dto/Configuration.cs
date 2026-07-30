public record ConfigurationQuery : IRequest<IEnumerable<Configuration>>
{
    // Configuration
    public Guid? Id { get; set; }
    public StateCode? StateCode { get; set; }
    public string? Group { get; set; }
    public string? Key { get; set; }
    public ProgramUnit? ProgramUnit { get; set; }
}

public record Configuration : IDto
{
    public Guid Id { get; set; }
    public StateCode StateCode { get; set; }
    public string? Group { get; set; }
    public string? Key { get; set; }
    public string Value { get; set; } = string.Empty;
    public ProgramUnit? ProgramUnit { get; set; }
}

public record GetKeyValueCommand(IEnumerable<Configuration> Configurations, string Key, string? Group, ProgramUnit? ProgramUnit) : IRequest<string>;