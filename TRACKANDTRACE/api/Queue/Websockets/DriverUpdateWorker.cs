using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

public class DriverUpdateWorker : BackgroundService
{
    private readonly DriverUpdateQueue _updateQueue;
    private readonly IWebSocketPublisher _webSocketPublisher;
    private readonly ILogger<DriverUpdateWorker> _logger;
    private readonly TimeSpan _batchInterval = TimeSpan.FromMilliseconds(500); // Batch every 500ms
    private const int BatchSize = 10; // Max 10 drivers per batch

    public DriverUpdateWorker(DriverUpdateQueue updateQueue, IWebSocketPublisher webSocketPublisher, ILogger<DriverUpdateWorker> logger)
    {
        _updateQueue = updateQueue;
        _webSocketPublisher = webSocketPublisher;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            // Dequeue updates in batches
            var updates = await _updateQueue.DequeueBatchAsync(BatchSize, _batchInterval);

            if (updates.Any())
            {
                try
                {
                    // Publish all updates in a single WebSocket request
                    await _webSocketPublisher.PublishAsync("driver-updates", updates);

                    // Log the IDs of the published drivers
                    var driverIds = updates.Select(driver => driver.Id.ToString()).ToArray();
                    _logger.LogInformation($"Published {updates.Count} driver updates: {string.Join(", ", driverIds)}");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to publish updates");
                }
            }
        }
    }
}