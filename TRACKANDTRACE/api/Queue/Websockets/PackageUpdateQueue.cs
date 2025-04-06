using System.Collections.Concurrent;

public class PackageUpdateQueue
{
    private readonly ConcurrentQueue<Package> _packageQueue = new();

    private readonly SemaphoreSlim _signal = new(0);

    public void Enqueue(Package package)
    {
        _packageQueue.Enqueue(package);
        _signal.Release();
        Console.WriteLine($"Package with ID {package.Id} enqueued.");
    }

    public async Task<List<Package>> DequeueBatchAsync(int batchSize, TimeSpan timeout)
    {
        var batch = new List<Package>();

        while (batch.Count < batchSize)
        {
            if (await _signal.WaitAsync(timeout))
            {
                if (_packageQueue.TryDequeue(out var package))
                {
                    batch.Add(package);
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