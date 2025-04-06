// using Microsoft.Extensions.Hosting;
// using Microsoft.Extensions.Logging;
// using System;
// using System.Collections.Generic;
// using System.Linq;
// using System.Threading;
// using System.Threading.Tasks;
// using TrackAndTrace.Repo.Drivers;
// using TrackAndTrace.Repo.Packages;
// using TrackAndTrace.Repo.Shipments;
// using TrackAndTrace.TimeProvider;

// public class PackageWorker : BackgroundService
// {
//     private readonly PackageQueue _packageQueue;
//     private readonly ITimeService _timeService;
//     private readonly ILogger<PackageWorker> _logger;

//     private readonly IRepoShipment _shipmentRepo;
//     private readonly IRepoPackages _packageRepo;
//     private readonly IRepoDriver _driverRepo;

//     private readonly DriverUpdateQueue _driverUpdateQueue;
//     private readonly PackageUpdateQueue _packageUpdateQueue;
//     private readonly ShipmentUpdateQueue _shipmentUpdateQueue;

//     private readonly IWebSocketPublisher _webSocketPublisher;

//     private const int BatchSize = 10;

//     public PackageWorker(
//         PackageQueue packageQueue,
//         ITimeService timeService,
//         ILogger<PackageWorker> logger,
//         IRepoShipment shipmentRepo,
//         IRepoPackages packageRepo,
//         IRepoDriver driverRepo,
//         DriverUpdateQueue driverUpdateQueue,
//         PackageUpdateQueue packageUpdateQueue,
//         IWebSocketPublisher webSocketPublisher,
//         ShipmentUpdateQueue shipmentUpdateQueue)
//     {
//         _packageQueue = packageQueue;
//         _timeService = timeService;
//         _logger = logger;

//         _timeService.TimeChanged += OnTimeChanged;
//         _shipmentRepo = shipmentRepo;
//         _packageRepo = packageRepo;
//         _driverRepo = driverRepo;
//         _driverUpdateQueue = driverUpdateQueue;
//         _packageUpdateQueue = packageUpdateQueue;
//         _webSocketPublisher = webSocketPublisher;
//         _shipmentUpdateQueue = shipmentUpdateQueue;
//     }

//     private void OnTimeChanged(object sender, EventArgs e)
//     {
//         if (_timeService.PreviousTime.HasValue &&
//             _timeService.PreviousTime.Value.Date != _timeService.Now.Date)
//         {
//             _logger.LogInformation("New day detected. Sorting the queue into shipments.");
//             SortQueueIntoShipments().Wait();
//         }
//     }

//     protected override async Task ExecuteAsync(CancellationToken stoppingToken)
//     {
//         while (!stoppingToken.IsCancellationRequested)
//         {
//             // Wait for a period before checking again
//             await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
//         }
//     }

//     private async Task SortQueueIntoShipments()
//     {
//         _logger.LogInformation("Starting to sort queue into shipments.");

//         if (_packageQueue == null)
//         {
//             _logger.LogError("_packageQueue is null.");
//             throw new InvalidOperationException("_packageQueue is not initialized.");
//         }

//         if (_shipmentRepo == null)
//         {
//             _logger.LogError("_shipmentRepo is null.");
//             throw new InvalidOperationException("_shipmentRepo is not initialized.");
//         }

//         if (_driverRepo == null)
//         {
//             _logger.LogError("_driverRepo is null.");
//             throw new InvalidOperationException("_driverRepo is not initialized.");
//         }

//         var packages = await _packageQueue.GetAllPackagesAsync();
//         if (packages == null)
//         {
//             _logger.LogError("packages is null.");
//             throw new InvalidOperationException("Failed to retrieve packages from the queue.");
//         }

//         _logger.LogInformation($"Retrieved {packages.Count} packages from the queue.");

//         // Separate pickup (Pending) vs. delivery (Sorting)
//         var pickupPackages = packages
//             .Where(p => p.Status == TrackAndTrace.Models.Helpers.Status.Pending)
//             .ToList();
//         _logger.LogInformation($"Found {pickupPackages.Count} pickup packages.");

//         var sendPackages = packages
//             .Where(p => p.Status == TrackAndTrace.Models.Helpers.Status.Sorting)
//             .ToList();
//         _logger.LogInformation($"Found {sendPackages.Count} send packages.");

//         var allShipments = new List<Shipment>();

//         // ---------------------------------------
//         // Process PICKUP PACKAGES
//         // ---------------------------------------
//         while (pickupPackages.Any())
//         {
//             var drivers = await _shipmentRepo.GetDriversWithoutShipmentTypePickup();

//             // If no drivers are available, re-enqueue the first batch of packages
//             // and skip them for now.
//             if (!drivers.Any())
//             {
//                 _logger.LogWarning("No drivers available for pickup shipments. " +
//                                    "Re-enqueueing packages for the next day.");

//                 foreach (var package in pickupPackages.Take(BatchSize))
//                 {
//                     _packageQueue.Enqueue(package);
//                 }

//                 pickupPackages = pickupPackages.Skip(BatchSize).ToList();
//                 continue;
//             }

//             // Take up to BatchSize packages
//             var batchToPickup = pickupPackages.Take(BatchSize).ToList();
//             // Remove them from the pickupPackages list so we don't process them again
//             pickupPackages = pickupPackages.Skip(BatchSize).ToList();

//             // Filter out packages that are no longer actually 'Pending'
//             var validPickupPackages = new List<Package>();
//             foreach (var pkg in batchToPickup)
//             {
//                 // Re-fetch from repo to ensure we have the latest status
//                 var latestPackageState = await _packageRepo.GetPackage(pkg.Id);
//                 if (latestPackageState.Status == TrackAndTrace.Models.Helpers.Status.Pending)
//                 {
//                     validPickupPackages.Add(latestPackageState);
//                 }
//                 else
//                 {
//                     _logger.LogInformation(
//                         $"Package with ID {pkg.Id} is no longer Pending (status: {latestPackageState.Status}). Skipping.");
//                 }
//             }

//             // If no valid packages remain, don't create a shipment
//             if (!validPickupPackages.Any())
//             {
//                 _logger.LogInformation("No valid packages in this batch for pickup. Skipping shipment creation.");
//                 continue;
//             }

//             // We have at least 1 package to pick up
//             var driver = drivers.First();

//             var shipment = new Shipment
//             {
//                 Type = TrackAndTrace.Models.Helpers.Type.Pickup,
//                 Date = _timeService.Now,
//                 DriverId = driver.Id.ToString(),
//                 Status = TrackAndTrace.Models.Helpers.Status.Pickup,
//                 RouteHistory = new List<TrackAndTrace.Models.Helpers.GeoLocationWithDate>
//                 {
//                     new TrackAndTrace.Models.Helpers.GeoLocationWithDate
//                     {
//                         Date = _timeService.Now,
//                         Latitude = 50.82444524562267,
//                         Longitude = 3.2513378626369978
//                     }
//                 }
//             };

//             var createdShipment = await _shipmentRepo.AddShipment(shipment);
//             if (createdShipment == null)
//             {
//                 _logger.LogError("createdShipment is null for pickup.");
//                 throw new InvalidOperationException("Failed to create shipment (pickup).");
//             }

//             _shipmentUpdateQueue.Enqueue(createdShipment);
//             await _webSocketPublisher.PublishAsync($"shipment/{createdShipment.Id}", createdShipment);

//             _logger.LogInformation($"Created pickup shipment with ID {createdShipment.Id}.");

//             // Assign the new shipment to the driver
//             if (driver.PickupsIds == null)
//             {
//                 driver.PickupsIds = new List<string>();
//             }
//             driver.PickupsIds.Add(createdShipment.Id.ToString());
//             var updatedDriver = await _driverRepo.UpdateDriver(driver);
//             _driverUpdateQueue.Enqueue(updatedDriver);

//             _logger.LogInformation($"Assigned shipment ID {createdShipment.Id} to driver ID {driver.Id}.");

//             // Now update all valid packages and add them to the shipment
//             var shipmentPackagesIds = new List<string>();

//             foreach (var validPkg in validPickupPackages)
//             {
//                 // Check if the package is already updated by another instance
//                 var latestPackageState = await _packageRepo.GetPackage(validPkg.Id);
//                 if (latestPackageState.Status == TrackAndTrace.Models.Helpers.Status.Pickup)
//                 {
//                     _logger.LogInformation(
//                         $"Package with ID {validPkg.Id} is already updated to Pickup by another instance. Skipping.");
//                     continue;
//                 }

//                 validPkg.Status = TrackAndTrace.Models.Helpers.Status.Pickup;
//                 validPkg.TrackingHistory.Add(new TrackAndTrace.Models.Stage
//                 {
//                     Date = _timeService.Now,
//                     GeoLocation = new TrackAndTrace.Models.Helpers.GeoLocation
//                     {
//                         Latitude = validPkg.CurrentLocation.Latitude,
//                         Longitude = validPkg.CurrentLocation.Longitude
//                     },
//                     Status = TrackAndTrace.Models.Helpers.Status.Sorted,
//                 });

//                 var updatedPackage = await _packageRepo.UpdatePackage(validPkg);
//                 _packageUpdateQueue.Enqueue(updatedPackage);

//                 await _webSocketPublisher.PublishAsync($"package/{validPkg.Id}", updatedPackage);

//                 shipmentPackagesIds.Add(validPkg.Id);
//             }

//             // Attach the valid packages to the shipment
//             if (createdShipment.PackagesIds == null)
//             {
//                 createdShipment.PackagesIds = new List<string>();
//             }
//             createdShipment.PackagesIds.AddRange(shipmentPackagesIds);

//             var updatedShipment = await _shipmentRepo.UpdateShipment(createdShipment);
//             _shipmentUpdateQueue.Enqueue(updatedShipment);

//             // Remove the driver from the available list (so we don't assign them again in the same iteration)
//             drivers.Remove(driver);

//             allShipments.Add(updatedShipment);

//             _logger.LogInformation($"Pickup shipment {updatedShipment.Id} has {shipmentPackagesIds.Count} packages.");
//         }

//         // ---------------------------------------
//         // Process SEND PACKAGES (deliveries)
//         // ---------------------------------------
//         while (sendPackages.Any())
//         {
//             var drivers = await _shipmentRepo.GetDriversWithoutShipmentTypeDelivery();

//             // If no drivers, re-enqueue the first batch and skip
//             if (!drivers.Any())
//             {
//                 _logger.LogWarning("No drivers available for delivery shipments. " +
//                                    "Re-enqueueing packages for the next day.");

//                 foreach (var package in sendPackages.Take(BatchSize))
//                 {
//                     _packageQueue.Enqueue(package);
//                 }

//                 sendPackages = sendPackages.Skip(BatchSize).ToList();
//                 continue;
//             }

//             // Take up to BatchSize packages
//             var batchToSend = sendPackages.Take(BatchSize).ToList();
//             sendPackages = sendPackages.Skip(BatchSize).ToList();

//             // Filter out packages that are no longer 'Sorting'
//             var validDeliveryPackages = new List<Package>();
//             foreach (var pkg in batchToSend)
//             {
//                 var latestPackageState = await _packageRepo.GetPackage(pkg.Id);
//                 if (latestPackageState.Status == TrackAndTrace.Models.Helpers.Status.Sorting)
//                 {
//                     validDeliveryPackages.Add(latestPackageState);
//                 }
//                 else
//                 {
//                     _logger.LogInformation(
//                         $"Package with ID {pkg.Id} is no longer Sorting (status: {latestPackageState.Status}). Skipping.");
//                 }
//             }

//             if (!validDeliveryPackages.Any())
//             {
//                 _logger.LogInformation("No valid packages in this batch for delivery. Skipping shipment creation.");
//                 continue;
//             }

//             // Create a new shipment for these valid packages
//             var driver = drivers.First();

//             var shipment = new Shipment
//             {
//                 Type = TrackAndTrace.Models.Helpers.Type.Delivery,
//                 Date = _timeService.Now,
//                 DriverId = driver.Id.ToString(),
//                 Status = TrackAndTrace.Models.Helpers.Status.Sorted,
//                 RouteHistory = new List<TrackAndTrace.Models.Helpers.GeoLocationWithDate>
//                 {
//                     new TrackAndTrace.Models.Helpers.GeoLocationWithDate
//                     {
//                         Date = _timeService.Now,
//                         Latitude = 50.82444524562267,
//                         Longitude = 3.2513378626369978
//                     }
//                 }
//             };

//             var createdShipment = await _shipmentRepo.AddShipment(shipment);
//             if (createdShipment == null)
//             {
//                 _logger.LogError("createdShipment is null for delivery.");
//                 throw new InvalidOperationException("Failed to create shipment (delivery).");
//             }

//             _shipmentUpdateQueue.Enqueue(createdShipment);
//             await _webSocketPublisher.PublishAsync($"shipment/{createdShipment.Id}", createdShipment);

//             _logger.LogInformation($"Created delivery shipment with ID {createdShipment.Id}.");

//             // Assign the shipment to the driver
//             if (driver.ShipmentsIds == null)
//             {
//                 driver.ShipmentsIds = new List<string>();
//             }
//             driver.ShipmentsIds.Add(createdShipment.Id.ToString());
//             var updatedDriver = await _driverRepo.UpdateDriver(driver);
//             _driverUpdateQueue.Enqueue(updatedDriver);

//             _logger.LogInformation($"Assigned shipment ID {createdShipment.Id} to driver ID {driver.Id}.");

//             var shipmentPackagesIds = new List<string>();

//             foreach (var validPkg in validDeliveryPackages)
//             {
//                 var latestPackageState = await _packageRepo.GetPackage(validPkg.Id);
//                 if (latestPackageState.Status == TrackAndTrace.Models.Helpers.Status.Sorted)
//                 {
//                     _logger.LogInformation(
//                         $"Package with ID {validPkg.Id} is already updated to Sorted by another instance. Skipping.");
//                     continue;
//                 }

//                 validPkg.Status = TrackAndTrace.Models.Helpers.Status.Sorted;
//                 validPkg.TrackingHistory.Add(new TrackAndTrace.Models.Stage
//                 {
//                     Date = _timeService.Now,
//                     GeoLocation = new TrackAndTrace.Models.Helpers.GeoLocation
//                     {
//                         Latitude = 50.82444524562267,
//                         Longitude = 3.2513378626369978
//                     },
//                     Status = TrackAndTrace.Models.Helpers.Status.Sorted,
//                 });

//                 var updatedPackage = await _packageRepo.UpdatePackage(validPkg);
//                 _packageUpdateQueue.Enqueue(updatedPackage);

//                 await _webSocketPublisher.PublishAsync($"package/{validPkg.Id}", updatedPackage);

//                 shipmentPackagesIds.Add(validPkg.Id);
//             }

//             // Attach the packages to the shipment
//             if (createdShipment.PackagesIds == null)
//             {
//                 createdShipment.PackagesIds = new List<string>();
//             }
//             createdShipment.PackagesIds.AddRange(shipmentPackagesIds);

//             var updatedShipment = await _shipmentRepo.UpdateShipment(createdShipment);
//             _shipmentUpdateQueue.Enqueue(updatedShipment);

//             // Remove this driver
//             drivers.Remove(driver);

//             allShipments.Add(updatedShipment);

//             _logger.LogInformation($"Delivery shipment {updatedShipment.Id} has {shipmentPackagesIds.Count} packages.");
//         }

//         _logger.LogInformation("Finished sorting queue into shipments.");
//     }
// }
