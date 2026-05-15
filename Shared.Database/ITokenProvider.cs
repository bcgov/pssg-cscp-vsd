namespace Database;

public interface ITokenProvider
{
    Task<string> AcquireToken();
}
