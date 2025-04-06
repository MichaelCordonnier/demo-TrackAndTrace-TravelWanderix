// using TrackAndTrace.Repo.Drivers;
// using TrackAndTrace.Repo.Packages;
// using TrackAndTrace.Repo.Shipments;
// using TrackAndTrace.TimeProvider;
// using TrackAndTraceGrpc;
// // using TrackAndTraceGrpc.Shipment;

// namespace TrackAndTrace.GrpcServices;

// public class ShipmentService : ShipmentProto.ShipmentProtoBase
// {

//     private readonly IRepoShipment _shipmentRepo;

//     private readonly IRepoPackages _packageRepo;

//     private readonly IRepoDriver _driverRepo;

//     private readonly ITimeService _timeService;

//     private readonly PackageUpdateQueue _updateQueue;

//     private readonly ShipmentUpdateQueue _shipmentUpdateQueue;

//     private readonly DriverUpdateQueue _driverUpdateQueue;

//     // this will be used to sort the pickups back in shipments TYPE delivery
//     private readonly PackageQueue _queue;

//     // To publish to a specific shipment/package update 
//     private readonly IWebSocketPublisher _webSocketPublisher;


//     public ShipmentService(IRepoShipment shipmentRepo, IRepoPackages packageRepo, ITimeService timeService, PackageQueue queue, PackageUpdateQueue updateQueue, ShipmentUpdateQueue shipmentUpdateQueue, IWebSocketPublisher webSocketPublisher, IRepoDriver driverRepo, DriverUpdateQueue driverUpdateQueue)
//     {
//         _shipmentRepo = shipmentRepo;
//         _packageRepo = packageRepo;
//         _timeService = timeService;
//         _queue = queue;
//         _updateQueue = updateQueue;
//         _shipmentUpdateQueue = shipmentUpdateQueue;
//         _webSocketPublisher = webSocketPublisher;
//         _driverRepo = driverRepo;
//         _driverUpdateQueue = driverUpdateQueue;
//     }

//     public override async Task<ShipmentReply> GetShipment(ShipmentIdRequest request, ServerCallContext context)
//     {
//         var shipment = await _shipmentRepo.GetShipment(request.ShipmentId);

//         if (shipment == null)
//         {
//             throw new RpcException(new Grpc.Core.Status(StatusCode.NotFound, "Shipment not found"));
//         }

//         var routeHistory = shipment.RouteHistory?.Select(x =>
//             new TrackAndTraceGrpc.GeoLocationWithDate
//             {
//                 Date = x.Date.ToString(),
//                 Latitude = x.Latitude,
//                 Longitude = x.Longitude
//             }).ToList() ?? new List<TrackAndTraceGrpc.GeoLocationWithDate>();

//         var packages = new List<TrackAndTraceGrpc.Package>();

//         if (shipment.PackagesIds != null)
//         {
//             foreach (var packageId in shipment.PackagesIds)
//             {
//                 var package = await _packageRepo.GetPackage(packageId);

//                 packages.Add(new TrackAndTraceGrpc.Package
//                 {
//                     Id = package.Id.ToString(),
//                     Status = (TrackAndTraceGrpc.Status)package.Status,
//                     DestinationStreet = package.DestinationStreet,
//                     DestinationCountry = package.DestinationCountry,
//                     DestinationNumber = package.DestinationNumber,
//                     DestinationRegionCode = package.DestinationRegionCode,
//                     OriginAddress = package.OriginAdress,
//                     Date = package.Date.ToString(),
//                     CurrentLocation = package.CurrentLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
//                     {
//                         Latitude = package.CurrentLocation.Latitude,
//                         Longitude = package.CurrentLocation.Longitude
//                     } : null,
//                     DestinationLocation = package.DestinationLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
//                     {
//                         Latitude = package.DestinationLocation.Latitude,
//                         Longitude = package.DestinationLocation.Longitude
//                     } : null
//                 });
//             }
//         }

//         return new ShipmentReply
//         {
//             ShipmentId = shipment.Id.ToString(),
//             DriverId = shipment.DriverId ?? "",
//             Status = shipment.Status.HasValue ? (TrackAndTraceGrpc.Status)shipment.Status.Value : TrackAndTraceGrpc.Status.Pending,
//             Type = shipment.Type.HasValue ? (TrackAndTraceGrpc.Type)shipment.Type.Value : TrackAndTraceGrpc.Type.Tdelivery,
//             Date = shipment.Date.ToString(),
//             RouteHistory = { routeHistory },
//             CurrentLocation = shipment.CurrentLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
//             {
//                 Latitude = shipment.CurrentLocation.Latitude,
//                 Longitude = shipment.CurrentLocation.Longitude
//             } : null,
//             Packages = { packages }
//         };
//     }

//     public override async Task<ShipmentListReply> GetShipments(Empty request, ServerCallContext context)
//     {
//         var shipments = await _shipmentRepo.GetShipments();

//         var shipmentReplies = new List<ShipmentReply>();

//         foreach (var shipment in shipments)
//         {
//             var routeHistory = shipment.RouteHistory?.Select(x =>
//                 new TrackAndTraceGrpc.GeoLocationWithDate
//                 {
//                     Date = x.Date.ToString(),
//                     Latitude = x.Latitude,
//                     Longitude = x.Longitude
//                 }).ToList() ?? new List<TrackAndTraceGrpc.GeoLocationWithDate>();

//             var packages = new List<TrackAndTraceGrpc.Package>();

//             if (shipment.PackagesIds != null)
//             {
//                 foreach (var packageId in shipment.PackagesIds)
//                 {
//                     var package = await _packageRepo.GetPackage(packageId);
//                     if (package != null)
//                     {
//                         packages.Add(new TrackAndTraceGrpc.Package
//                         {
//                             Id = package.Id.ToString(),
//                             Status = (TrackAndTraceGrpc.Status)package.Status,
//                             DestinationStreet = package.DestinationStreet,
//                             DestinationCountry = package.DestinationCountry,
//                             DestinationNumber = package.DestinationNumber,
//                             DestinationRegionCode = package.DestinationRegionCode,
//                             OriginAddress = package.OriginAdress,
//                             Date = package.Date.ToString(),
//                             CurrentLocation = package.CurrentLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
//                             {
//                                 Latitude = package.CurrentLocation.Latitude,
//                                 Longitude = package.CurrentLocation.Longitude
//                             } : null,
//                             DestinationLocation = package.DestinationLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
//                             {
//                                 Latitude = package.DestinationLocation.Latitude,
//                                 Longitude = package.DestinationLocation.Longitude
//                             } : null
//                         });
//                     }
//                 }
//             }

//             shipmentReplies.Add(new ShipmentReply
//             {
//                 ShipmentId = shipment.Id.ToString(),
//                 DriverId = shipment.DriverId ?? "",
//                 Status = shipment.Status.HasValue ? (TrackAndTraceGrpc.Status)shipment.Status.Value : TrackAndTraceGrpc.Status.Pending,
//                 Type = shipment.Type.HasValue ? (TrackAndTraceGrpc.Type)shipment.Type.Value : TrackAndTraceGrpc.Type.Tdelivery,
//                 Date = shipment.Date.ToString(),
//                 RouteHistory = { routeHistory },
//                 CurrentLocation = shipment.CurrentLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
//                 {
//                     Latitude = shipment.CurrentLocation.Latitude,
//                     Longitude = shipment.CurrentLocation.Longitude
//                 } : null,
//                 Packages = { packages }
//             });
//         }

//         return new ShipmentListReply
//         {
//             Shipments = { shipmentReplies }
//         };
//     }


//     public override async Task<ShipmentReply> UpdateShipment(UpdateShipmentRequest request, ServerCallContext context)
//     {
//         var shipment = await _shipmentRepo.GetShipment(request.ShipmentId);

//         Console.WriteLine($"Getting shipment with Id: {request.ShipmentId}");

//         Console.WriteLine($"Updating shipment: {shipment}");

//         if (shipment == null)
//         {
//             throw new RpcException(new Grpc.Core.Status(StatusCode.NotFound, "Shipment not found"));
//         }

//         var shipmentResult = new ShipmentReply();

//         // lets first off all resolve the fields 

//         var packagesResolvePurpose = new List<TrackAndTrace.Models.Package>();

//         if (shipment.PackagesIds != null)
//         {
//             foreach (var packageId in shipment.PackagesIds)
//             {
//                 var package = await _packageRepo.GetPackage(packageId);
//                 if (package != null)
//                 {
//                     packagesResolvePurpose.Add(package);
//                 }
//             }
//         }



//         if (request.NewStatus == TrackAndTraceGrpc.Status.InTransit)
//         {
//             {
//                 if (request.CurrentLocation != null &&
//                     request.CurrentLocation.Latitude == 50.82444524562267 &&
//                     request.CurrentLocation.Longitude == 3.2513378626369978)
//                 {
//                     shipment.Status = (Models.Helpers.Status)request.NewStatus;

//                     if (shipment.Type == Models.Helpers.Type.Delivery)
//                     {
//                         // update all the packages to intransit
//                         foreach (var package in packagesResolvePurpose)
//                         {
//                             package.Status = Models.Helpers.Status.InTransit;
//                             package.TrackingHistory.Add(new TrackAndTrace.Models.Stage
//                             {
//                                 Date = _timeService.Now,
//                                 GeoLocation = new Models.Helpers.GeoLocation
//                                 {
//                                     Latitude = package.CurrentLocation.Latitude,
//                                     Longitude = package.CurrentLocation.Longitude
//                                 },
//                                 Status = Models.Helpers.Status.InTransit
//                             });

//                             await _packageRepo.UpdatePackage(package);
//                             _updateQueue.Enqueue(package);
//                             await _webSocketPublisher.PublishAsync($"package/{package.Id}", package);
//                         }

//                         // update the shipment
//                         shipment.Date = _timeService.Now;
//                         shipment.CurrentLocation = new Models.Helpers.GeoLocation
//                         {
//                             Latitude = request.CurrentLocation.Latitude,
//                             Longitude = request.CurrentLocation.Longitude
//                         };
//                         shipment.Status = Models.Helpers.Status.InTransit;

//                         shipment.RouteHistory.Add(new TrackAndTrace.Models.Helpers.GeoLocationWithDate
//                         {
//                             Date = _timeService.Now,
//                             Latitude = shipment.CurrentLocation.Latitude,
//                             Longitude = shipment.CurrentLocation.Longitude
//                         });

//                         var updatedShipment = await _shipmentRepo.UpdateShipment(shipment);

//                         _shipmentUpdateQueue.Enqueue(updatedShipment);
//                         await _webSocketPublisher.PublishShipmentAsync($"shipment/{updatedShipment.Id}", updatedShipment);

//                         // now we gonne resolve for the driver grpc response    
//                         var routeHistory = updatedShipment.RouteHistory?.Select(x =>
//                             new TrackAndTraceGrpc.GeoLocationWithDate
//                             {
//                                 Date = x.Date.ToString(),
//                                 Latitude = x.Latitude,
//                                 Longitude = x.Longitude
//                             }).ToList() ?? new List<TrackAndTraceGrpc.GeoLocationWithDate>();

//                         var packages = new List<TrackAndTraceGrpc.Package>();

//                         if (shipment.PackagesIds != null)
//                         {
//                             foreach (var packageId in shipment.PackagesIds)
//                             {
//                                 var package = await _packageRepo.GetPackage(packageId);

//                                 packages.Add(new TrackAndTraceGrpc.Package
//                                 {
//                                     Id = package.Id.ToString(),
//                                     Status = (TrackAndTraceGrpc.Status)package.Status,
//                                     DestinationStreet = package.DestinationStreet,
//                                     DestinationCountry = package.DestinationCountry,
//                                     DestinationNumber = package.DestinationNumber,
//                                     DestinationRegionCode = package.DestinationRegionCode,
//                                     OriginAddress = package.OriginAdress,
//                                     Date = package.Date.ToString(),
//                                     CurrentLocation = package.CurrentLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
//                                     {
//                                         Latitude = package.CurrentLocation.Latitude,
//                                         Longitude = package.CurrentLocation.Longitude
//                                     } : null,
//                                     DestinationLocation = package.DestinationLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
//                                     {
//                                         Latitude = package.DestinationLocation.Latitude,
//                                         Longitude = package.DestinationLocation.Longitude
//                                     } : null
//                                 });
//                             }
//                         }

//                         return new ShipmentReply
//                         {
//                             ShipmentId = updatedShipment.Id.ToString(),
//                             DriverId = updatedShipment.DriverId ?? "",
//                             Status = updatedShipment.Status.HasValue ? (TrackAndTraceGrpc.Status)updatedShipment.Status.Value : TrackAndTraceGrpc.Status.Pending,
//                             Type = updatedShipment.Type.HasValue ? (TrackAndTraceGrpc.Type)updatedShipment.Type.Value : TrackAndTraceGrpc.Type.Tdelivery,
//                             Date = updatedShipment.Date.ToString(),
//                             RouteHistory = { routeHistory },
//                             CurrentLocation = updatedShipment.CurrentLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
//                             {
//                                 Latitude = updatedShipment.CurrentLocation.Latitude,
//                                 Longitude = updatedShipment.CurrentLocation.Longitude
//                             } : null,
//                             Packages = { packages }
//                         };
//                     }
//                     else if (shipment.Type == Models.Helpers.Type.Pickup)
//                     {
//                         // this is when a driver departs out of the warehouse to go pickup the packages

//                         foreach (var package in packagesResolvePurpose)
//                         {
//                             package.Status = Models.Helpers.Status.Pickup;
//                             package.TrackingHistory.Add(new TrackAndTrace.Models.Stage
//                             {
//                                 Date = _timeService.Now,
//                                 GeoLocation = new Models.Helpers.GeoLocation
//                                 {
//                                     Latitude = package.CurrentLocation.Latitude,
//                                     Longitude = package.CurrentLocation.Longitude
//                                 },
//                                 Status = Models.Helpers.Status.Pickup
//                             });

//                             await _packageRepo.UpdatePackage(package);
//                             _updateQueue.Enqueue(package);
//                             await _webSocketPublisher.PublishAsync($"package/{package.Id}", package);
//                         }

//                         shipment.Date = _timeService.Now;
//                         shipment.CurrentLocation = new Models.Helpers.GeoLocation
//                         {
//                             Latitude = request.CurrentLocation.Latitude,
//                             Longitude = request.CurrentLocation.Longitude
//                         };
//                         shipment.Status = Models.Helpers.Status.InTransit;


//                         if (shipment.RouteHistory == null)
//                         {
//                             shipment.RouteHistory = new List<TrackAndTrace.Models.Helpers.GeoLocationWithDate>();
//                         }

//                         shipment.RouteHistory.Add(new TrackAndTrace.Models.Helpers.GeoLocationWithDate
//                         {
//                             Date = _timeService.Now,
//                             Latitude = shipment.CurrentLocation.Latitude,
//                             Longitude = shipment.CurrentLocation.Longitude
//                         });
//                         var updatedShipment = await _shipmentRepo.UpdateShipment(shipment);

//                         _shipmentUpdateQueue.Enqueue(updatedShipment);
//                         await _webSocketPublisher.PublishShipmentAsync($"shipment/{updatedShipment.Id}", updatedShipment);

//                         var routeHistory = updatedShipment.RouteHistory?.Select(x =>
//                                                    new TrackAndTraceGrpc.GeoLocationWithDate
//                                                    {
//                                                        Date = x.Date.ToString(),
//                                                        Latitude = x.Latitude,
//                                                        Longitude = x.Longitude
//                                                    }).ToList() ?? new List<TrackAndTraceGrpc.GeoLocationWithDate>();

//                         var packages = new List<TrackAndTraceGrpc.Package>();

//                         if (shipment.PackagesIds != null)
//                         {
//                             foreach (var packageId in shipment.PackagesIds)
//                             {
//                                 var package = await _packageRepo.GetPackage(packageId);

//                                 packages.Add(new TrackAndTraceGrpc.Package
//                                 {
//                                     Id = package.Id.ToString(),
//                                     Status = (TrackAndTraceGrpc.Status)package.Status,
//                                     DestinationStreet = package.DestinationStreet,
//                                     DestinationCountry = package.DestinationCountry,
//                                     DestinationNumber = package.DestinationNumber,
//                                     DestinationRegionCode = package.DestinationRegionCode,
//                                     OriginAddress = package.OriginAdress,
//                                     Date = package.Date.ToString(),
//                                     CurrentLocation = package.CurrentLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
//                                     {
//                                         Latitude = package.CurrentLocation.Latitude,
//                                         Longitude = package.CurrentLocation.Longitude
//                                     } : null,
//                                     DestinationLocation = package.DestinationLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
//                                     {
//                                         Latitude = package.DestinationLocation.Latitude,
//                                         Longitude = package.DestinationLocation.Longitude
//                                     } : null
//                                 });
//                             }
//                         }

//                         return new ShipmentReply
//                         {
//                             ShipmentId = updatedShipment.Id.ToString(),
//                             DriverId = updatedShipment.DriverId ?? "",
//                             Status = updatedShipment.Status.HasValue ? (TrackAndTraceGrpc.Status)updatedShipment.Status.Value : TrackAndTraceGrpc.Status.Pending,
//                             Type = updatedShipment.Type.HasValue ? (TrackAndTraceGrpc.Type)updatedShipment.Type.Value : TrackAndTraceGrpc.Type.Tdelivery,
//                             Date = updatedShipment.Date.ToString(),
//                             RouteHistory = { routeHistory },
//                             CurrentLocation = updatedShipment.CurrentLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
//                             {
//                                 Latitude = updatedShipment.CurrentLocation.Latitude,
//                                 Longitude = updatedShipment.CurrentLocation.Longitude
//                             } : null,
//                             Packages = { packages }
//                         };

//                     }


//                 }
//                 else
//                 {
//                     // we gonne check if their are packages are on that location if so we gonne give some information for the driver and update the packages accordingly

//                     var packagesOnLocation = new Boolean();

//                     if (shipment.Type == Models.Helpers.Type.Delivery)
//                     {

//                         var packagesToDeliver = new List<TrackAndTraceGrpc.Package>();

//                         foreach (var package in packagesResolvePurpose)
//                         {
//                             if (package.CurrentLocation.Latitude == request.CurrentLocation.Latitude &&
//                                 package.CurrentLocation.Longitude == request.CurrentLocation.Longitude)
//                             {
//                                 package.Status = Models.Helpers.Status.Delivered;
//                                 package.CurrentLocation = new Models.Helpers.GeoLocation
//                                 {
//                                     Latitude = request.CurrentLocation.Latitude,
//                                     Longitude = request.CurrentLocation.Longitude
//                                 };

//                                 package.TrackingHistory.Add(new TrackAndTrace.Models.Stage
//                                 {
//                                     Date = _timeService.Now,
//                                     GeoLocation = new Models.Helpers.GeoLocation
//                                     {
//                                         Latitude = package.CurrentLocation.Latitude,
//                                         Longitude = package.CurrentLocation.Longitude
//                                     },
//                                     Status = Models.Helpers.Status.Delivered
//                                 });

//                                 await _packageRepo.UpdatePackage(package);
//                                 _updateQueue.Enqueue(package);
//                                 await _webSocketPublisher.PublishAsync($"package/{package.Id}", package);

//                                 // add to packagesToDeliver
//                                 var packageGrpc = new TrackAndTraceGrpc.Package
//                                 {
//                                     Id = package.Id.ToString(),
//                                     Status = (TrackAndTraceGrpc.Status)package.Status,
//                                     DestinationStreet = package.DestinationStreet,
//                                     DestinationCountry = package.DestinationCountry,
//                                     DestinationNumber = package.DestinationNumber,
//                                     DestinationRegionCode = package.DestinationRegionCode,
//                                     OriginAddress = package.OriginAdress,
//                                     Date = package.Date.ToString(),
//                                     CurrentLocation = package.CurrentLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
//                                     {
//                                         Latitude = package.CurrentLocation.Latitude,
//                                         Longitude = package.CurrentLocation.Longitude
//                                     } : null,
//                                     DestinationLocation = package.DestinationLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
//                                     {
//                                         Latitude = package.DestinationLocation.Latitude,
//                                         Longitude = package.DestinationLocation.Longitude
//                                     } : null
//                                 };

//                                 packagesToDeliver.Add(packageGrpc);

//                             }

//                             // update shipment 
//                             shipment.Date = _timeService.Now;
//                             shipment.CurrentLocation = new Models.Helpers.GeoLocation
//                             {
//                                 Latitude = request.CurrentLocation.Latitude,
//                                 Longitude = request.CurrentLocation.Longitude
//                             };
//                             shipment.Status = Models.Helpers.Status.InTransit;
//                             shipment.RouteHistory.Add(new TrackAndTrace.Models.Helpers.GeoLocationWithDate
//                             {
//                                 Date = _timeService.Now,
//                                 Latitude = shipment.CurrentLocation.Latitude,
//                                 Longitude = shipment.CurrentLocation.Longitude
//                             });

//                             // we gone resolve again because we need the latest packages 
//                             var packagesLatest = new List<TrackAndTraceGrpc.Package>();

//                             if (shipment.PackagesIds != null)
//                             {
//                                 foreach (var packageId in shipment.PackagesIds)
//                                 {
//                                     var packageNew = await _packageRepo.GetPackage(packageId);

//                                     packagesLatest.Add(new TrackAndTraceGrpc.Package
//                                     {
//                                         Id = packageNew.Id.ToString(),
//                                         Status = (TrackAndTraceGrpc.Status)packageNew.Status,
//                                         DestinationStreet = packageNew.DestinationStreet,
//                                         DestinationCountry = packageNew.DestinationCountry,
//                                         DestinationNumber = packageNew.DestinationNumber,
//                                         DestinationRegionCode = packageNew.DestinationRegionCode,
//                                         OriginAddress = packageNew.OriginAdress,
//                                         Date = packageNew.Date.ToString(),
//                                         CurrentLocation = packageNew.CurrentLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
//                                         {
//                                             Latitude = packageNew.CurrentLocation.Latitude,
//                                             Longitude = packageNew.CurrentLocation.Longitude
//                                         } : null,
//                                         DestinationLocation = packageNew.DestinationLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
//                                         {
//                                             Latitude = packageNew.DestinationLocation.Latitude,
//                                             Longitude = packageNew.DestinationLocation.Longitude
//                                         } : null
//                                     });
//                                 }
//                             }

//                             if (packagesLatest.All(x => x.Status == TrackAndTraceGrpc.Status.Delivered))
//                             {
//                                 shipment.Status = Models.Helpers.Status.Delivered;
//                                 shipment.CurrentLocation = new Models.Helpers.GeoLocation
//                                 {
//                                     Latitude = 50.82444524562267,
//                                     Longitude = 3.2513378626369978
//                                 };

//                                 shipment.RouteHistory.Add(new TrackAndTrace.Models.Helpers.GeoLocationWithDate
//                                 {
//                                     Date = _timeService.Now,
//                                     Latitude = shipment.CurrentLocation.Latitude,
//                                     Longitude = shipment.CurrentLocation.Longitude
//                                 });

//                                 // remove it from the driver
//                                 var driver = await _driverRepo.GetDriver(shipment.DriverId);

//                                 if (driver != null)
//                                 {
//                                     driver.ShipmentsIds.Remove(shipment.Id);
//                                     var updatedDriver = await _driverRepo.UpdateDriver(driver);

//                                     _driverUpdateQueue.Enqueue(updatedDriver);
//                                 }
//                             }

//                             var updatedShipment = await _shipmentRepo.UpdateShipment(shipment);

//                             _shipmentUpdateQueue.Enqueue(updatedShipment);
//                             await _webSocketPublisher.PublishShipmentAsync($"shipment/{updatedShipment.Id}", updatedShipment);


//                             var routeHistory = updatedShipment.RouteHistory?.Select(x =>
//                                 new TrackAndTraceGrpc.GeoLocationWithDate
//                                 {
//                                     Date = x.Date.ToString(),
//                                     Latitude = x.Latitude,
//                                     Longitude = x.Longitude
//                                 }).ToList() ?? new List<TrackAndTraceGrpc.GeoLocationWithDate>();

//                             return new ShipmentReply
//                             {
//                                 ShipmentId = updatedShipment.Id.ToString(),
//                                 DriverId = updatedShipment.DriverId ?? "",
//                                 Status = updatedShipment.Status.HasValue ? (TrackAndTraceGrpc.Status)updatedShipment.Status.Value : TrackAndTraceGrpc.Status.Pending,
//                                 Type = updatedShipment.Type.HasValue ? (TrackAndTraceGrpc.Type)updatedShipment.Type.Value : TrackAndTraceGrpc.Type.Tdelivery,
//                                 Date = updatedShipment.Date.ToString(),
//                                 RouteHistory = { routeHistory },
//                                 CurrentLocation = updatedShipment.CurrentLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
//                                 {
//                                     Latitude = updatedShipment.CurrentLocation.Latitude,
//                                     Longitude = updatedShipment.CurrentLocation.Longitude
//                                 } : null,
//                                 Packages = { packagesLatest },
//                                 PackagesToDropOff = { packagesToDeliver }
//                             };
//                         }




//                     }
//                     else if (shipment.Type == Models.Helpers.Type.Pickup)
//                     {
//                         var packagesToPickup = new List<TrackAndTraceGrpc.Package>();

//                         foreach (var package in packagesResolvePurpose)
//                         {
//                             if (package.CurrentLocation.Latitude == request.CurrentLocation.Latitude &&
//                                package.CurrentLocation.Longitude == request.CurrentLocation.Longitude)
//                             {
//                                 package.Status = Models.Helpers.Status.Sorting;
//                                 package.CurrentLocation = new Models.Helpers.GeoLocation
//                                 {
//                                     Latitude = 50.82444524562267,
//                                     Longitude = 3.2513378626369978
//                                 };

//                                 package.TrackingHistory.Add(new TrackAndTrace.Models.Stage
//                                 {
//                                     Date = _timeService.Now,
//                                     GeoLocation = new Models.Helpers.GeoLocation
//                                     {
//                                         Latitude = 50.82444524562267,
//                                         Longitude = 3.2513378626369978
//                                     },
//                                     Status = Models.Helpers.Status.Sorting
//                                 });

//                                 await _packageRepo.UpdatePackage(package);
//                                 _updateQueue.Enqueue(package);
//                                 // we gonne set them on the sort queue
//                                 _queue.Enqueue(package);
//                                 await _webSocketPublisher.PublishAsync($"package/{package.Id}", package);

//                                 // add to packagesToDeliver
//                                 var packageGrpc = new TrackAndTraceGrpc.Package
//                                 {
//                                     Id = package.Id.ToString(),
//                                     Status = (TrackAndTraceGrpc.Status)package.Status,
//                                     DestinationStreet = package.DestinationStreet,
//                                     DestinationCountry = package.DestinationCountry,
//                                     DestinationNumber = package.DestinationNumber,
//                                     DestinationRegionCode = package.DestinationRegionCode,
//                                     OriginAddress = package.OriginAdress,
//                                     Date = package.Date.ToString(),
//                                     CurrentLocation = package.CurrentLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
//                                     {
//                                         Latitude = package.CurrentLocation.Latitude,
//                                         Longitude = package.CurrentLocation.Longitude
//                                     } : null,
//                                     DestinationLocation = package.DestinationLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
//                                     {
//                                         Latitude = package.DestinationLocation.Latitude,
//                                         Longitude = package.DestinationLocation.Longitude
//                                     } : null
//                                 };

//                                 packagesToPickup.Add(packageGrpc);
//                             }

//                             // update shipment
//                             shipment.Date = _timeService.Now;
//                             shipment.CurrentLocation = new Models.Helpers.GeoLocation
//                             {
//                                 Latitude = request.CurrentLocation.Latitude,
//                                 Longitude = request.CurrentLocation.Longitude
//                             };
//                             shipment.Status = Models.Helpers.Status.InTransit;
//                             shipment.RouteHistory.Add(new TrackAndTrace.Models.Helpers.GeoLocationWithDate
//                             {
//                                 Date = _timeService.Now,
//                                 Latitude = shipment.CurrentLocation.Latitude,
//                                 Longitude = shipment.CurrentLocation.Longitude
//                             });

//                             // we gone resolve again because we need the latest packages
//                             var packagesLatest = new List<TrackAndTraceGrpc.Package>();

//                             if (shipment.PackagesIds != null)
//                             {
//                                 foreach (var packageId in shipment.PackagesIds)
//                                 {
//                                     var packageNew = await _packageRepo.GetPackage(packageId);

//                                     packagesLatest.Add(new TrackAndTraceGrpc.Package
//                                     {
//                                         Id = packageNew.Id.ToString(),
//                                         Status = (TrackAndTraceGrpc.Status)packageNew.Status,
//                                         DestinationStreet = packageNew.DestinationStreet,
//                                         DestinationCountry = packageNew.DestinationCountry,
//                                         DestinationNumber = packageNew.DestinationNumber,
//                                         DestinationRegionCode = packageNew.DestinationRegionCode,
//                                         OriginAddress = packageNew.OriginAdress,
//                                         Date = packageNew.Date.ToString(),
//                                         CurrentLocation = packageNew.CurrentLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
//                                         {
//                                             Latitude = packageNew.CurrentLocation.Latitude,
//                                             Longitude = packageNew.CurrentLocation.Longitude
//                                         } : null,
//                                         DestinationLocation = packageNew.DestinationLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
//                                         {
//                                             Latitude = packageNew.DestinationLocation.Latitude,
//                                             Longitude = packageNew.DestinationLocation.Longitude
//                                         } : null
//                                     });
//                                 }
//                             }

//                             if (packagesLatest.All(x => x.Status == TrackAndTraceGrpc.Status.Delivered))
//                             {
//                                 shipment.Status = Models.Helpers.Status.Delivered;
//                                 shipment.CurrentLocation = new Models.Helpers.GeoLocation
//                                 {
//                                     Latitude = 50.82444524562267,
//                                     Longitude = 3.2513378626369978
//                                 };

//                                 shipment.RouteHistory.Add(new TrackAndTrace.Models.Helpers.GeoLocationWithDate
//                                 {
//                                     Date = _timeService.Now,
//                                     Latitude = shipment.CurrentLocation.Latitude,
//                                     Longitude = shipment.CurrentLocation.Longitude
//                                 });

//                                 var driver = await _driverRepo.GetDriver(shipment.DriverId);

//                                 if (driver != null)
//                                 {
//                                     driver.ShipmentsIds.Remove(shipment.Id);
//                                     var updatedDriver = await _driverRepo.UpdateDriver(driver);

//                                     _driverUpdateQueue.Enqueue(updatedDriver);
//                                 }
//                             }

//                             var updatedShipment = await _shipmentRepo.UpdateShipment(shipment);

//                             _shipmentUpdateQueue.Enqueue(updatedShipment);
//                             await _webSocketPublisher.PublishShipmentAsync($"shipment/{updatedShipment.Id}", updatedShipment);



//                             var routeHistory = updatedShipment.RouteHistory?.Select(x =>
//                                 new TrackAndTraceGrpc.GeoLocationWithDate
//                                 {
//                                     Date = x.Date.ToString(),
//                                     Latitude = x.Latitude,
//                                     Longitude = x.Longitude
//                                 }).ToList() ?? new List<TrackAndTraceGrpc.GeoLocationWithDate>();

//                             return new ShipmentReply
//                             {
//                                 ShipmentId = updatedShipment.Id.ToString(),
//                                 DriverId = updatedShipment.DriverId ?? "",
//                                 Status = updatedShipment.Status.HasValue ? (TrackAndTraceGrpc.Status)updatedShipment.Status.Value : TrackAndTraceGrpc.Status.Pending,
//                                 Type = updatedShipment.Type.HasValue ? (TrackAndTraceGrpc.Type)updatedShipment.Type.Value : TrackAndTraceGrpc.Type.Tpickup,
//                                 Date = updatedShipment.Date.ToString(),
//                                 RouteHistory = { routeHistory },
//                                 CurrentLocation = updatedShipment.CurrentLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
//                                 {
//                                     Latitude = updatedShipment.CurrentLocation.Latitude,
//                                     Longitude = updatedShipment.CurrentLocation.Longitude
//                                 } : null,
//                                 Packages = { packagesLatest },
//                                 PackagesToDropOff = { packagesToPickup }
//                             };
//                         }
//                     }
//                     else
//                     {
//                         throw new RpcException(new Grpc.Core.Status(StatusCode.FailedPrecondition, "Invalid shipment Type"));
//                     }






//                 }

//             }
//         }
//         throw new RpcException(new Grpc.Core.Status(StatusCode.Internal, "Unhandled code path"));

//     }


//     public override async Task<ShipmentListReply> GetShipmentsByDriverId(DriverIdRequest request, ServerCallContext context)
//     {
//         var shipments = await _shipmentRepo.GetShipmentsByDriverId(request.Id);

//         var shipmentReplies = new List<ShipmentReply>();

//         foreach (var shipment in shipments)
//         {
//             var routeHistory = shipment.RouteHistory?.Select(x =>
//                 new TrackAndTraceGrpc.GeoLocationWithDate
//                 {
//                     Date = x.Date.ToString(),
//                     Latitude = x.Latitude,
//                     Longitude = x.Longitude
//                 }).ToList() ?? new List<TrackAndTraceGrpc.GeoLocationWithDate>();

//             var packages = new List<TrackAndTraceGrpc.Package>();

//             if (shipment.PackagesIds != null)
//             {
//                 foreach (var packageId in shipment.PackagesIds)
//                 {
//                     var package = await _packageRepo.GetPackage(packageId);
//                     if (package != null)
//                     {
//                         packages.Add(new TrackAndTraceGrpc.Package
//                         {
//                             Id = package.Id.ToString(),
//                             Status = (TrackAndTraceGrpc.Status)package.Status,
//                             DestinationStreet = package.DestinationStreet,
//                             DestinationCountry = package.DestinationCountry,
//                             DestinationNumber = package.DestinationNumber,
//                             DestinationRegionCode = package.DestinationRegionCode,
//                             OriginAddress = package.OriginAdress,
//                             Date = package.Date.ToString(),
//                             CurrentLocation = package.CurrentLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
//                             {
//                                 Latitude = package.CurrentLocation.Latitude,
//                                 Longitude = package.CurrentLocation.Longitude
//                             } : null,
//                             DestinationLocation = package.DestinationLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
//                             {
//                                 Latitude = package.DestinationLocation.Latitude,
//                                 Longitude = package.DestinationLocation.Longitude
//                             } : null
//                         });
//                     }
//                 }
//             }

//             shipmentReplies.Add(new ShipmentReply
//             {
//                 ShipmentId = shipment.Id.ToString(),
//                 DriverId = shipment.DriverId ?? "",
//                 Status = shipment.Status.HasValue ? (TrackAndTraceGrpc.Status)shipment.Status.Value : TrackAndTraceGrpc.Status.Pending,
//                 Type = shipment.Type.HasValue ? (TrackAndTraceGrpc.Type)shipment.Type.Value : TrackAndTraceGrpc.Type.Tdelivery,
//                 Date = shipment.Date.ToString(),
//                 RouteHistory = { routeHistory },
//                 CurrentLocation = shipment.CurrentLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
//                 {
//                     Latitude = shipment.CurrentLocation.Latitude,
//                     Longitude = shipment.CurrentLocation.Longitude
//                 } : null,
//                 Packages = { packages }
//             });
//         }

//         return new ShipmentListReply
//         {
//             Shipments = { shipmentReplies }
//         };

//     }

// }