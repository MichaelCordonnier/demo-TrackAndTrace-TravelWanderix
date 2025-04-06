using System.Threading.Tasks;
using RabbitMQ.Client;

public interface IRabbitMqConnectionProvider
{
    Task InitializeAsync();
    IConnection GetConnection();
}

public class RabbitMqConnectionProvider : IRabbitMqConnectionProvider
{
    private readonly string _hostName;
    private readonly int _port;
    private readonly string _userName;
    private readonly string _password;
    private IConnection _connection;

    public RabbitMqConnectionProvider(string hostName, int port, string userName, string password)
    {
        _hostName = hostName;
        _port     = port;
        _userName = userName;
        _password = password;
    }

    public async Task InitializeAsync()
    {
        var factory = new ConnectionFactory
        {
            HostName = _hostName,
            Port     = _port,
            UserName = _userName,
            Password = _password
        };

        _connection = await factory.CreateConnectionAsync().ConfigureAwait(false);
    }

    public IConnection GetConnection() => _connection;
}
