public class PackageUpdateWorker : BackgroundService
{
    private readonly PackageUpdateQueue _packageUpdateQueue;

    private readonly IWebSocketPublisher _webSocketPublisher;

    private readonly TimeSpan _batchInterval = TimeSpan.FromMilliseconds(500);

    private const int BatchSize = 10;

    public PackageUpdateWorker(PackageUpdateQueue packageUpdateQueue, IWebSocketPublisher webSocketPublisher)
    {
        _packageUpdateQueue = packageUpdateQueue;
        _webSocketPublisher = webSocketPublisher;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var updates = await _packageUpdateQueue.DequeueBatchAsync(BatchSize, _batchInterval);

            if (updates.Any())
            {
                try
                {
                    await _webSocketPublisher.PublishAsync("package-updates", updates);

                    var packageIds = updates.Select(package => package.Id.ToString()).ToArray();
                    Console.WriteLine($"Published {updates.Count} package updates: {string.Join(", ", packageIds)}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Failed to publish updates");
                }
            }
        }


    }
}


