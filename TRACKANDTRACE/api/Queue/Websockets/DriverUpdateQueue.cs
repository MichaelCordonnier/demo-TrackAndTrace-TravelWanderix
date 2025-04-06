using System.Collections.Concurrent;
using Microsoft.Extensions.Logging;

public class DriverUpdateQueue
{
    private readonly ConcurrentQueue<Driver> _driverQueue = new();
    private readonly SemaphoreSlim _signal = new(0);
    private readonly ILogger<DriverUpdateQueue> _logger;

    public DriverUpdateQueue(ILogger<DriverUpdateQueue> logger)
    {
        _logger = logger;
    }

    public void Enqueue(Driver driver)
    {
        _driverQueue.Enqueue(driver);
        _signal.Release();
        _logger.LogInformation($"Driver with ID {driver.Id} has been added to the queue.");
    }

    public async Task<List<Driver>> DequeueBatchAsync(int batchSize, TimeSpan timeout)
    {
        var batch = new List<Driver>();

        while (batch.Count < batchSize)
        {
            if (await _signal.WaitAsync(timeout))
            {
                if (_driverQueue.TryDequeue(out var driver))
                {
                    batch.Add(driver);
                }
            }
            else
            {
                break; // Timeout reached
            }
        }

        return batch;
    }
}