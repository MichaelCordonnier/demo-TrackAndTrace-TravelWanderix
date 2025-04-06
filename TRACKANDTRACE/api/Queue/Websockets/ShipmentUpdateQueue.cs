using System.Collections.Concurrent;

public class ShipmentUpdateQueue
{
    private readonly ConcurrentQueue<Shipment> _shipmentQueue = new();

    private readonly SemaphoreSlim _signal = new(0);

    public void Enqueue(Shipment shipment)
    {
        _shipmentQueue.Enqueue(shipment);
        _signal.Release();
        Console.WriteLine($"Shipment with ID {shipment.Id} enqueued.");
    }

    public async Task<List<Shipment>> DequeueBatchAsync(int batchSize, TimeSpan timeout)
    {
        var batch = new List<Shipment>();

        while (batch.Count < batchSize)
        {
            if (await _signal.WaitAsync(timeout))
            {
                if (_shipmentQueue.TryDequeue(out var Shipment))
                {
                    batch.Add(Shipment);
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