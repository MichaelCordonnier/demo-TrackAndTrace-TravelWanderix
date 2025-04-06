using System.Text;
using System.Text.Json;
using RabbitMQ.Client;

public interface ITimeUpdatePublisher
{
    Task PublishTimeUpdate(DateTime newTime);
}

public class RabbitMqTimeUpdatePublisher : ITimeUpdatePublisher
{
    private readonly IRabbitMqConnectionProvider _connectionProvider;
    private const string QueueName = "time-updates-queue";

    public RabbitMqTimeUpdatePublisher(IRabbitMqConnectionProvider connectionProvider)
    {
        _connectionProvider = connectionProvider;
    }

    public async Task PublishTimeUpdate(DateTime newTime)
    {
        var connection = _connectionProvider.GetConnection();
        var channel = await connection.CreateChannelAsync();

        var arguments = new Dictionary<string, object?>
        {
            { "x-max-length", 1 },
            { "x-overflow", "drop-head" }
        };

        await channel.QueueDeclareAsync(queue: QueueName, durable: false, exclusive: false, autoDelete: false, arguments: arguments);

        var result = await channel.BasicGetAsync(QueueName, true);
       
        if (result != null)
        {
            Console.WriteLine("Acknowledge message");
            await channel.BasicAckAsync(result.DeliveryTag, false);
        }

        var currentTime = DateTime.UtcNow;

        var message = JsonSerializer.Serialize(new { Time = newTime, TimeMessageWasSend = currentTime });

       var body = Encoding.UTF8.GetBytes(message);

        var props = new BasicProperties();

        props.ContentType = "text/plain";

        props.DeliveryMode = (DeliveryModes)2;

        var routingKey = "time-updates";

        await channel.BasicPublishAsync("", routingKey: QueueName, mandatory: true, basicProperties: props, body: body);
    }

}
