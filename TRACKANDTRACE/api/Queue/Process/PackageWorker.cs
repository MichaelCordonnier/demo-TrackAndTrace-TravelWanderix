using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using TrackAndTrace.Repo.Drivers;
using TrackAndTrace.Repo.Packages;
using TrackAndTrace.Repo.Shipments;
using TrackAndTrace.TimeProvider;

public class PackageWorker : BackgroundService
{
    private readonly PackageQueue _packageQueue;
    private readonly ITimeService _timeService;
    private readonly ILogger<PackageWorker> _logger;

    private readonly IRepoShipment _shipmentRepo;
    private readonly IRepoPackages _packageRepo;
    private readonly IRepoDriver _driverRepo;

    private readonly DriverUpdateQueue _driverUpdateQueue;
    private readonly PackageUpdateQueue _packageUpdateQueue;
    private readonly ShipmentUpdateQueue _shipmentUpdateQueue;

    private readonly IWebSocketPublisher _webSocketPublisher;

    private const int BatchSize = 10;
    private List<Package> _sortedPackages;

    public PackageWorker(
        PackageQueue packageQueue,
        ITimeService timeService,
        ILogger<PackageWorker> logger,
        IRepoShipment shipmentRepo,
        IRepoPackages packageRepo,
        IRepoDriver driverRepo,
        DriverUpdateQueue driverUpdateQueue,
        PackageUpdateQueue packageUpdateQueue,
        IWebSocketPublisher webSocketPublisher,
        ShipmentUpdateQueue shipmentUpdateQueue)
    {
        _packageQueue = packageQueue;
        _timeService = timeService;
        _logger = logger;

        _timeService.TimeChanged += OnTimeChanged;
        _packageQueue.PackageReceived += OnPackageReceived;
        _shipmentRepo = shipmentRepo;
        _packageRepo = packageRepo;
        _driverRepo = driverRepo;
        _driverUpdateQueue = driverUpdateQueue;
        _packageUpdateQueue = packageUpdateQueue;
        _webSocketPublisher = webSocketPublisher;
        _shipmentUpdateQueue = shipmentUpdateQueue;

        _sortedPackages = new List<Package>();
    }

    private void OnTimeChanged(object sender, EventArgs e)
    {
        if (_timeService.PreviousTime.HasValue &&
            _timeService.PreviousTime.Value.Date != _timeService.Now.Date)
        {
            _logger.LogInformation("New day detected. Deploying shipments.");
            DeployShipments().Wait();
        }
    }

    private async void OnPackageReceived(object sender, PackageEventArgs e)
    {
        _logger.LogInformation($"Package {e.Package.Id} received. Sorting immediately.");
        await SortPackageAsync(e.Package);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }

    private async Task SortPackageAsync(Package package)
    {
        var latestPackage = await _packageRepo.GetPackage(package.Id);


        if (latestPackage.Status == TrackAndTrace.Models.Helpers.Status.Sorting ||
            latestPackage.Status == TrackAndTrace.Models.Helpers.Status.Pending)
        {
            _sortedPackages.Add(latestPackage);
            _packageQueue.Dequeue(package.Id);
            _logger.LogInformation($"Package {package.Id} sorted for the next day's shipment.");
        }
    }

    private async Task DeployShipments()
    {
        if (!_sortedPackages.Any())
        {
            _logger.LogInformation("No sorted packages to deploy.");
            return;
        }

        var pickupPackages = _sortedPackages
            .Where(p => p.Status == TrackAndTrace.Models.Helpers.Status.Pending)
            .ToList();

        var deliveryPackages = _sortedPackages
            .Where(p => p.Status == TrackAndTrace.Models.Helpers.Status.Sorting)
            .ToList();
        
        _sortedPackages = _sortedPackages
        .Where(p => p.Status != TrackAndTrace.Models.Helpers.Status.Pending &&
                    p.Status != TrackAndTrace.Models.Helpers.Status.Sorting)
        .ToList();

        await CreateShipmentsAsync(pickupPackages, TrackAndTrace.Models.Helpers.Type.Pickup);

        await CreateShipmentsAsync(deliveryPackages, TrackAndTrace.Models.Helpers.Type.Delivery);

      

        _logger.LogInformation("Shipments deployed and sorted packages updated.");
    }

    private async Task CreateShipmentsAsync(List<Package> packages, TrackAndTrace.Models.Helpers.Type shipmentType)
    {
        while (packages.Any())
        {
   
            var drivers = shipmentType == TrackAndTrace.Models.Helpers.Type.Pickup
                ? await _shipmentRepo.GetDriversWithoutShipmentTypePickup()
                : await _shipmentRepo.GetDriversWithoutShipmentTypeDelivery();

            if (!drivers.Any())
            {
                _logger.LogWarning($"No drivers available for {shipmentType} shipments. Remaining packages will be retried tomorrow.");
                return;
            }

            var batch = packages.Take(BatchSize).ToList();
            packages = packages.Skip(BatchSize).ToList();

            if (!batch.Any())
            {
                _logger.LogInformation($"No packages in the batch for {shipmentType} shipment. Skipping shipment creation.");
                continue;
            }

            var driver = drivers.First();

            var shipment = new Shipment
            {
                Type = shipmentType,
                Date = _timeService.Now,
                DriverId = driver.Id.ToString(),
                Status = TrackAndTrace.Models.Helpers.Status.Pending,
                PackagesIds = new List<string>(),
                RouteHistory = new List<TrackAndTrace.Models.Helpers.GeoLocationWithDate>
                {
                    new TrackAndTrace.Models.Helpers.GeoLocationWithDate
                    {
                        Date = _timeService.Now,
                        Latitude = 50.82444524562267,
                        Longitude = 3.2513378626369978
                    }
                }
            };

            foreach (var package in batch.ToList())
            {
                var latestPackage = await _packageRepo.GetPackage(package.Id);

                if (latestPackage.Status == TrackAndTrace.Models.Helpers.Status.Pickup ||
                    latestPackage.Status == TrackAndTrace.Models.Helpers.Status.Sorted)
                {
                    _logger.LogWarning($"Package {package.Id} has already been added to another shipment. Skipping.");
                    continue;
                }

                latestPackage.Status = shipmentType == TrackAndTrace.Models.Helpers.Type.Pickup
                    ? TrackAndTrace.Models.Helpers.Status.Pickup
                    : TrackAndTrace.Models.Helpers.Status.Sorted;
                
                latestPackage.TrackingHistory.Add(new TrackAndTrace.Models.Stage
                {
                    Date = _timeService.Now,
                    GeoLocation = latestPackage.CurrentLocation,
                    Status = latestPackage.Status
                });

                await _packageRepo.UpdatePackage(latestPackage);
                _packageUpdateQueue.Enqueue(latestPackage);
                await _webSocketPublisher.PublishAsync($"package/{package.Id}", latestPackage);

                shipment.PackagesIds.Add(latestPackage.Id);
                
                _sortedPackages.Remove(latestPackage);
            }

            if (!shipment.PackagesIds.Any())
            {
                _logger.LogWarning($"No valid packages for {shipmentType} shipment. Shipment creation skipped.");
                continue;
            }

            var createdShipment = await _shipmentRepo.AddShipment(shipment);
            if (createdShipment == null)
            {
                _logger.LogError("Failed to create shipment.");
                continue;
            }

            createdShipment.Status = shipmentType == TrackAndTrace.Models.Helpers.Type.Pickup
                ? TrackAndTrace.Models.Helpers.Status.Pickup
                : TrackAndTrace.Models.Helpers.Status.Sorted;

            var updatedShipment = await _shipmentRepo.UpdateShipment(createdShipment);

            _shipmentUpdateQueue.Enqueue(updatedShipment);
            await _webSocketPublisher.PublishAsync($"shipment/{updatedShipment.Id}", updatedShipment);

            if (shipmentType == TrackAndTrace.Models.Helpers.Type.Pickup)
            {
                driver.PickupsIds ??= new List<string>();
                driver.PickupsIds.Add(updatedShipment.Id);
            }
            else
            {
                driver.ShipmentsIds ??= new List<string>();
                driver.ShipmentsIds.Add(updatedShipment.Id);
            }

            await _driverRepo.UpdateDriver(driver);
            _driverUpdateQueue.Enqueue(driver);
            _logger.LogInformation($"Created {shipmentType} shipment with ID {updatedShipment.Id} for driver {driver.Id}.");
        }
    }
}
