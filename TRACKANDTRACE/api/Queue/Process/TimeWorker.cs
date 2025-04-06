using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using TrackAndTrace.TimeProvider; // your ITimeService


public class TimeUpdateWorker : BackgroundService
{
    private readonly IRabbitMqConnectionProvider _connectionProvider;
    private readonly ILogger<TimeUpdateWorker> _logger;
    private readonly ITimeService _timeService;

    private IConnection _connection;
    private const string QueueName = "time-updates-queue";

    public TimeUpdateWorker(
        IRabbitMqConnectionProvider connectionProvider,
        ILogger<TimeUpdateWorker> logger,
        ITimeService timeService)
    {
        _connectionProvider = connectionProvider;
        _logger = logger;
        _timeService = timeService;
    }

    public override async Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("TimeUpdateWorker starting...");

        _connection = _connectionProvider.GetConnection();

        using var channel = await _connection.CreateChannelAsync();

        var arguments = new Dictionary<string, object?>
        {
            { "x-max-length", 1 },
            { "x-overflow", "drop-head" }
        };

        await channel.QueueDeclareAsync(queue: QueueName, durable: false, exclusive: false, autoDelete: false, arguments: arguments);

        var result = await channel.BasicGetAsync(QueueName, true);

        if (result != null)
        {
            var message = Encoding.UTF8.GetString(result.Body.ToArray());

            var timeUpdate = JsonSerializer.Deserialize<TimeUpdateMessage>(message);


            if (timeUpdate.Time.HasValue && timeUpdate.TimeMessageWasSend.HasValue)
            {
                var timeDifference = timeUpdate.TimeMessageWasSend.Value - DateTime.UtcNow;

                timeUpdate.Time = timeUpdate.Time.Value.Add(timeDifference);

                _logger.LogInformation($"Setting time to {timeUpdate.Time.Value}");

                _timeService.SetTimeWithNotification(timeUpdate.Time.Value);
            }
        }

        _logger.LogInformation("TimeUpdateWorker started.");

        await base.StartAsync(cancellationToken);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {

            Console.WriteLine("TimeUpdateWorker ExecuteAsync");
            _connectionProvider.GetConnection();
            using var channel = await _connection.CreateChannelAsync();

            var consumer = new AsyncEventingBasicConsumer(channel);

            consumer.ReceivedAsync += async (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);

                _logger.LogInformation($"New message received: {message}");

                var timeUpdate = JsonSerializer.Deserialize<TimeUpdateMessage>(message);

                Console.WriteLine("TimeUpdateWorker Time: " + timeUpdate.Time);

                if (timeUpdate.Time.HasValue && timeUpdate.TimeMessageWasSend.HasValue)
                {
                    var timeDifference = timeUpdate.TimeMessageWasSend.Value - DateTime.UtcNow;

                    timeUpdate.Time = timeUpdate.Time.Value.Add(timeDifference);

                    _timeService.SetTimeWithNotification(timeUpdate.Time.Value);
                }
            };

            channel.BasicConsumeAsync(queue: QueueName, autoAck: false, consumer: consumer);

            await Task.Delay(Timeout.Infinite, stoppingToken);
    }

    public override void Dispose()
    {
        _connection?.Dispose();
        base.Dispose();
    }
}

public class TimeUpdateMessage
{
    public DateTime? Time { get; set; }

    public DateTime? TimeMessageWasSend { get; set; }
}
