using TrackAndTrace.Repo.Packages;

public class ShipmentUpdateWorker : BackgroundService
{
    private readonly ShipmentUpdateQueue _shipmentUpdateQueue;
    private readonly IWebSocketPublisher _webSocketPublisher;
    private readonly IRepoPackages _packageRepo;
    private readonly TimeSpan _batchInterval = TimeSpan.FromMilliseconds(500);
    private const int BatchSize = 10;

    public ShipmentUpdateWorker(ShipmentUpdateQueue shipmentUpdateQueue, IWebSocketPublisher webSocketPublisher, IRepoPackages packageRepo)
    {
        _shipmentUpdateQueue = shipmentUpdateQueue;
        _webSocketPublisher = webSocketPublisher;
        _packageRepo = packageRepo;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var updates = await _shipmentUpdateQueue.DequeueBatchAsync(BatchSize, _batchInterval);

            if (updates.Any())
            {
                try
                {
                    foreach (var shipment in updates)
                    {
                        var packageDetails = new List<Package>();
                        foreach (var packageId in shipment.PackagesIds)
                        {
                            Console.WriteLine($"Fetching package with ID: {packageId}");
                            var package = await _packageRepo.GetPackage(packageId);
                            if (package != null)
                            {
                                packageDetails.Add(package);
                                Console.WriteLine($"Fetched package with ID: {package.Id}");
                            }
                            else
                            {
                                Console.WriteLine($"Package with ID: {packageId} not found");
                            }
                        }

                        // initialiaze the packages property of the shipment
                        if (shipment.Packages == null)
                        {
                            shipment.Packages = new List<Package>();
                        }

                        shipment.Packages = packageDetails;
                        Console.WriteLine($"Shipment ID: {shipment.Id} has {shipment.Packages.Count} packages");
                    }

                    await _webSocketPublisher.PublishAsync("Shipment-updates", updates);

                    var shipmentIds = updates.Select(shipment => shipment.Id.ToString()).ToArray();
                    Console.WriteLine($"Published {updates.Count} shipment updates: {string.Join(", ", shipmentIds)}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Failed to publish updates: {ex.Message}");
                }
            }
        }
    }
}