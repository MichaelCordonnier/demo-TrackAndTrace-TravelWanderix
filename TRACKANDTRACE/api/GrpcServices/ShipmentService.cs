using TrackAndTrace.Repo.Drivers;
using TrackAndTrace.Repo.Packages;
using TrackAndTrace.Repo.Shipments;
using TrackAndTrace.TimeProvider;
using TrackAndTraceGrpc;
// using TrackAndTraceGrpc.Shipment;

namespace TrackAndTrace.GrpcServices;

public class ShipmentService : ShipmentProto.ShipmentProtoBase
{

    private readonly IRepoShipment _shipmentRepo;

    private readonly IRepoPackages _packageRepo;

    private readonly IRepoDriver _driverRepo;

    private readonly ITimeService _timeService;

    private readonly PackageUpdateQueue _updateQueue;

    private readonly ShipmentUpdateQueue _shipmentUpdateQueue;

    private readonly DriverUpdateQueue _driverUpdateQueue;

    // this will be used to sort the pickups back in shipments TYPE delivery
    private readonly PackageQueue _queue;

    // To publish to a specific shipment/package update 
    private readonly IWebSocketPublisher _webSocketPublisher;


    public ShipmentService(IRepoShipment shipmentRepo, IRepoPackages packageRepo, ITimeService timeService, PackageQueue queue, PackageUpdateQueue updateQueue, ShipmentUpdateQueue shipmentUpdateQueue, IWebSocketPublisher webSocketPublisher, IRepoDriver driverRepo, DriverUpdateQueue driverUpdateQueue)
    {
        _shipmentRepo = shipmentRepo;
        _packageRepo = packageRepo;
        _timeService = timeService;
        _queue = queue;
        _updateQueue = updateQueue;
        _shipmentUpdateQueue = shipmentUpdateQueue;
        _webSocketPublisher = webSocketPublisher;
        _driverRepo = driverRepo;
        _driverUpdateQueue = driverUpdateQueue;
    }

    public override async Task<ShipmentReply> GetShipment(ShipmentIdRequest request, ServerCallContext context)
    {
        var shipment = await _shipmentRepo.GetShipment(request.ShipmentId);

        if (shipment == null)
        {
            throw new RpcException(new Grpc.Core.Status(StatusCode.NotFound, "Shipment not found"));
        }

        var routeHistory = shipment.RouteHistory?.Select(x =>
            new TrackAndTraceGrpc.GeoLocationWithDate
            {
                Date = x.Date.ToString(),
                Latitude = x.Latitude,
                Longitude = x.Longitude
            }).ToList() ?? new List<TrackAndTraceGrpc.GeoLocationWithDate>();

        var packages = new List<TrackAndTraceGrpc.Package>();

        if (shipment.PackagesIds != null)
        {
            foreach (var packageId in shipment.PackagesIds)
            {
                var package = await _packageRepo.GetPackage(packageId);

                packages.Add(new TrackAndTraceGrpc.Package
                {
                    Id = package.Id.ToString(),
                    Status = (TrackAndTraceGrpc.Status)package.Status,
                    DestinationStreet = package.DestinationStreet,
                    DestinationCountry = package.DestinationCountry,
                    DestinationNumber = package.DestinationNumber,
                    DestinationRegionCode = package.DestinationRegionCode,
                    OriginAddress = package.OriginAdress,
                    Date = package.Date.ToString(),
                    CurrentLocation = package.CurrentLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
                    {
                        Latitude = package.CurrentLocation.Latitude,
                        Longitude = package.CurrentLocation.Longitude
                    } : null,
                    DestinationLocation = package.DestinationLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
                    {
                        Latitude = package.DestinationLocation.Latitude,
                        Longitude = package.DestinationLocation.Longitude
                    } : null,
                    OriginLocation = package.OriginLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
                    {
                        Latitude = package.OriginLocation.Latitude,
                        Longitude = package.OriginLocation.Longitude
                    } : null
                });
            }
        }

        return new ShipmentReply
        {
            ShipmentId = shipment.Id.ToString(),
            DriverId = shipment.DriverId ?? "",
            Status = shipment.Status.HasValue ? (TrackAndTraceGrpc.Status)shipment.Status.Value : TrackAndTraceGrpc.Status.Pending,
            Type = shipment.Type.HasValue ? (TrackAndTraceGrpc.Type)shipment.Type.Value : TrackAndTraceGrpc.Type.Tdelivery,
            Date = shipment.Date.ToString(),
            RouteHistory = { routeHistory },
            CurrentLocation = shipment.CurrentLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
            {
                Latitude = shipment.CurrentLocation.Latitude,
                Longitude = shipment.CurrentLocation.Longitude
            } : null,
            Packages = { packages }
        };
    }

    public override async Task<ShipmentListReply> GetShipments(Empty request, ServerCallContext context)
    {
        var shipments = await _shipmentRepo.GetShipments();

        var shipmentReplies = new List<ShipmentReply>();

        foreach (var shipment in shipments)
        {
            var routeHistory = shipment.RouteHistory?.Select(x =>
                new TrackAndTraceGrpc.GeoLocationWithDate
                {
                    Date = x.Date.ToString(),
                    Latitude = x.Latitude,
                    Longitude = x.Longitude
                }).ToList() ?? new List<TrackAndTraceGrpc.GeoLocationWithDate>();

            var packages = new List<TrackAndTraceGrpc.Package>();

            if (shipment.PackagesIds != null)
            {
                foreach (var packageId in shipment.PackagesIds)
                {
                    var package = await _packageRepo.GetPackage(packageId);
                    if (package != null)
                    {
                        packages.Add(new TrackAndTraceGrpc.Package
                        {
                            Id = package.Id.ToString(),
                            Status = (TrackAndTraceGrpc.Status)package.Status,
                            DestinationStreet = package.DestinationStreet,
                            DestinationCountry = package.DestinationCountry,
                            DestinationNumber = package.DestinationNumber,
                            DestinationRegionCode = package.DestinationRegionCode,
                            OriginAddress = package.OriginAdress,
                            Date = package.Date.ToString(),
                            CurrentLocation = package.CurrentLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
                            {
                                Latitude = package.CurrentLocation.Latitude,
                                Longitude = package.CurrentLocation.Longitude
                            } : null,
                            DestinationLocation = package.DestinationLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
                            {
                                Latitude = package.DestinationLocation.Latitude,
                                Longitude = package.DestinationLocation.Longitude
                            } : null,
                            OriginLocation = package.OriginLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
                            {
                                Latitude = package.OriginLocation.Latitude,
                                Longitude = package.OriginLocation.Longitude
                            } : null
                        });
                    }
                }
            }

            shipmentReplies.Add(new ShipmentReply
            {
                ShipmentId = shipment.Id.ToString(),
                DriverId = shipment.DriverId ?? "",
                Status = shipment.Status.HasValue ? (TrackAndTraceGrpc.Status)shipment.Status.Value : TrackAndTraceGrpc.Status.Pending,
                Type = shipment.Type.HasValue ? (TrackAndTraceGrpc.Type)shipment.Type.Value : TrackAndTraceGrpc.Type.Tdelivery,
                Date = shipment.Date.ToString(),
                RouteHistory = { routeHistory },
                CurrentLocation = shipment.CurrentLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
                {
                    Latitude = shipment.CurrentLocation.Latitude,
                    Longitude = shipment.CurrentLocation.Longitude
                } : null,
                Packages = { packages }
            });
        }

        return new ShipmentListReply
        {
            Shipments = { shipmentReplies }
        };
    }

    public override async Task<ShipmentReply> UpdateShipment(UpdateShipmentRequest request, ServerCallContext context)
    {
        var shipment = await _shipmentRepo.GetShipment(request.ShipmentId);

        Console.WriteLine($"Getting shipment with Id: {request.ShipmentId}");
        Console.WriteLine($"Updating shipment: {shipment}");

        if (shipment == null)
        {
            throw new RpcException(new Grpc.Core.Status(StatusCode.NotFound, "Shipment not found"));
        }

        // "fire-and-forget" for actual DB updates after modifications. Based on https://dev.to/souvikk27/fire-and-forget-strategy-for-non-blocking-long-running-tasks-5b1o ==> this is a gamechanger

        var shipmentResult = new ShipmentReply();

        var packagesResolvePurpose = new List<TrackAndTrace.Models.Package>();
        if (shipment.PackagesIds != null)
        {
            foreach (var packageId in shipment.PackagesIds)
            {
                var package = await _packageRepo.GetPackage(packageId);
                if (package != null)
                {
                    packagesResolvePurpose.Add(package);
                }
            }
        }

        // 
        // Handle logic for InTransit
        // 

        Console.WriteLine($"Status: {request.NewStatus} == InTransit: {TrackAndTraceGrpc.Status.InTransit}");

        Console.WriteLine($"CurrentLocation: {request.CurrentLocation}");

        // check if the new status is InTransit
        if (request.NewStatus != TrackAndTraceGrpc.Status.InTransit)
        {
            Console.WriteLine("New status is not InTransit, returning");
            throw new RpcException(new Grpc.Core.Status(StatusCode.InvalidArgument, "Invalid status"));
        }



        if (request.NewStatus == TrackAndTraceGrpc.Status.InTransit)
        {
            // Warehouse is Penta, because we need a location to start from
            // ;D
            if (request.CurrentLocation != null &&
                request.CurrentLocation.Latitude == 50.82444524562267 &&
                request.CurrentLocation.Longitude == 3.2513378626369978)
            {
                shipment.Status = (Models.Helpers.Status)request.NewStatus;

                if (shipment.Type == Models.Helpers.Type.Delivery)
                {
                    // Update all packages to InTransit
                    foreach (var package in packagesResolvePurpose)
                    {
                        // check if packagestatus is not already InTransit
                        if (package.Status != Models.Helpers.Status.InTransit)
                        {

                            package.Status = Models.Helpers.Status.InTransit;
                            package.TrackingHistory.Add(new TrackAndTrace.Models.Stage
                            {
                                Date = _timeService.Now,
                                GeoLocation = new Models.Helpers.GeoLocation
                                {
                                    Latitude = package.CurrentLocation.Latitude,
                                    Longitude = package.CurrentLocation.Longitude
                                },
                                Status = Models.Helpers.Status.InTransit
                            });

                            // Fire-and-forget DB & WS
                            _ = _packageRepo.UpdatePackage(package);
                            _updateQueue.Enqueue(package);
                            _ = _webSocketPublisher.PublishAsync($"package/{package.Id}", package);
                        }

                    }

                    // Update shipment VARIABLE
                    shipment.Date = _timeService.Now;
                    shipment.CurrentLocation = new Models.Helpers.GeoLocation
                    {
                        Latitude = request.CurrentLocation.Latitude,
                        Longitude = request.CurrentLocation.Longitude
                    };
                    shipment.Status = Models.Helpers.Status.InTransit;

                    shipment.RouteHistory.Add(new TrackAndTrace.Models.Helpers.GeoLocationWithDate
                    {
                        Date = _timeService.Now,
                        Latitude = shipment.CurrentLocation.Latitude,
                        Longitude = shipment.CurrentLocation.Longitude
                    });

                    // Fire-and-forget DB & WS
                    var updatedShipment = shipment;
                    _ = _shipmentRepo.UpdateShipment(shipment);
                    _shipmentUpdateQueue.Enqueue(updatedShipment);
                    _ = _webSocketPublisher.PublishShipmentAsync($"shipment/{updatedShipment.Id}", updatedShipment);

                    //  gRPC response using updatedShipment
                    var routeHistory = updatedShipment.RouteHistory?
                        .Select(x => new TrackAndTraceGrpc.GeoLocationWithDate
                        {
                            Date = x.Date.ToString(),
                            Latitude = x.Latitude,
                            Longitude = x.Longitude
                        }).ToList() ?? new List<TrackAndTraceGrpc.GeoLocationWithDate>();

                    var packagesGrpc = new List<TrackAndTraceGrpc.Package>();

                    if (updatedShipment.PackagesIds != null)
                    {
                        foreach (var packageId in updatedShipment.PackagesIds)
                        {
                            // refetch from DB final in-memory changes if needed.
                            var package = await _packageRepo.GetPackage(packageId);
                            packagesGrpc.Add(new TrackAndTraceGrpc.Package
                            {
                                Id = package.Id.ToString(),
                                Status = (TrackAndTraceGrpc.Status)package.Status,
                                DestinationStreet = package.DestinationStreet,
                                DestinationCountry = package.DestinationCountry,
                                DestinationNumber = package.DestinationNumber,
                                DestinationRegionCode = package.DestinationRegionCode,
                                OriginAddress = package.OriginAdress,
                                Date = package.Date.ToString(),
                                CurrentLocation = package.CurrentLocation != null
                                    ? new TrackAndTraceGrpc.GrpcGeoLocation
                                    {
                                        Latitude = package.CurrentLocation.Latitude,
                                        Longitude = package.CurrentLocation.Longitude
                                    }
                                    : null,
                                DestinationLocation = package.DestinationLocation != null
                                    ? new TrackAndTraceGrpc.GrpcGeoLocation
                                    {
                                        Latitude = package.DestinationLocation.Latitude,
                                        Longitude = package.DestinationLocation.Longitude
                                    }
                                    : null,
                                OriginLocation = package.OriginLocation != null
                                    ? new TrackAndTraceGrpc.GrpcGeoLocation
                                    {
                                        Latitude = package.OriginLocation.Latitude,
                                        Longitude = package.OriginLocation.Longitude
                                    }
                                    : null
                            });
                        }
                    }

                    return new ShipmentReply
                    {
                        ShipmentId = updatedShipment.Id.ToString(),
                        DriverId = updatedShipment.DriverId ?? "",
                        Status = updatedShipment.Status.HasValue
                            ? (TrackAndTraceGrpc.Status)updatedShipment.Status.Value
                            : TrackAndTraceGrpc.Status.Pending,
                        Type = updatedShipment.Type.HasValue
                            ? (TrackAndTraceGrpc.Type)updatedShipment.Type.Value
                            : TrackAndTraceGrpc.Type.Tdelivery,
                        Date = updatedShipment.Date.ToString(),
                        RouteHistory = { routeHistory },
                        CurrentLocation = updatedShipment.CurrentLocation != null
                            ? new TrackAndTraceGrpc.GrpcGeoLocation
                            {
                                Latitude = updatedShipment.CurrentLocation.Latitude,
                                Longitude = updatedShipment.CurrentLocation.Longitude
                            }
                            : null,
                        Packages = { packagesGrpc }
                    };
                }
                else if (shipment.Type == Models.Helpers.Type.Pickup)
                {
                    // Driver departs warehouse to pick up packages
                    foreach (var package in packagesResolvePurpose)
                    {
                        package.Status = Models.Helpers.Status.Pickup;
                        package.TrackingHistory.Add(new TrackAndTrace.Models.Stage
                        {
                            Date = _timeService.Now,
                            GeoLocation = new Models.Helpers.GeoLocation
                            {
                                Latitude = package.OriginLocation.Latitude,
                                Longitude = package.OriginLocation.Longitude
                            },
                            Status = Models.Helpers.Status.Pickup
                        });

                        // Fire-and-forget DB & WS
                        _ = _packageRepo.UpdatePackage(package);
                        _updateQueue.Enqueue(package);
                        _ = _webSocketPublisher.PublishAsync($"package/{package.Id}", package);
                    }

                    shipment.Date = _timeService.Now;
                    shipment.CurrentLocation = new Models.Helpers.GeoLocation
                    {
                        Latitude = request.CurrentLocation.Latitude,
                        Longitude = request.CurrentLocation.Longitude
                    };
                    shipment.Status = Models.Helpers.Status.InTransit;

                    if (shipment.RouteHistory == null)
                    {
                        shipment.RouteHistory = new List<TrackAndTrace.Models.Helpers.GeoLocationWithDate>();
                    }

                    shipment.RouteHistory.Add(new TrackAndTrace.Models.Helpers.GeoLocationWithDate
                    {
                        Date = _timeService.Now,
                        Latitude = shipment.CurrentLocation.Latitude,
                        Longitude = shipment.CurrentLocation.Longitude
                    });

                    var updatedShipment = shipment;
                    _ = _shipmentRepo.UpdateShipment(shipment);
                    _shipmentUpdateQueue.Enqueue(updatedShipment);
                    _ = _webSocketPublisher.PublishShipmentAsync($"shipment/{updatedShipment.Id}", updatedShipment);

                    var routeHistory = updatedShipment.RouteHistory?
                        .Select(x => new TrackAndTraceGrpc.GeoLocationWithDate
                        {
                            Date = x.Date.ToString(),
                            Latitude = x.Latitude,
                            Longitude = x.Longitude
                        }).ToList() ?? new List<TrackAndTraceGrpc.GeoLocationWithDate>();

                    var packagesGrpc = new List<TrackAndTraceGrpc.Package>();
                    if (updatedShipment.PackagesIds != null)
                    {
                        foreach (var packageId in updatedShipment.PackagesIds)
                        {
                            var package = await _packageRepo.GetPackage(packageId);
                            packagesGrpc.Add(new TrackAndTraceGrpc.Package
                            {
                                Id = package.Id.ToString(),
                                Status = (TrackAndTraceGrpc.Status)package.Status,
                                DestinationStreet = package.DestinationStreet,
                                DestinationCountry = package.DestinationCountry,
                                DestinationNumber = package.DestinationNumber,
                                DestinationRegionCode = package.DestinationRegionCode,
                                OriginAddress = package.OriginAdress,
                                Date = package.Date.ToString(),
                                CurrentLocation = package.CurrentLocation != null
                                    ? new TrackAndTraceGrpc.GrpcGeoLocation
                                    {
                                        Latitude = package.CurrentLocation.Latitude,
                                        Longitude = package.CurrentLocation.Longitude
                                    }
                                    : null,
                                DestinationLocation = package.DestinationLocation != null
                                    ? new TrackAndTraceGrpc.GrpcGeoLocation
                                    {
                                        Latitude = package.DestinationLocation.Latitude,
                                        Longitude = package.DestinationLocation.Longitude
                                    }
                                    : null,
                                OriginLocation = package.OriginLocation != null
                                    ? new TrackAndTraceGrpc.GrpcGeoLocation
                                    {
                                        Latitude = package.OriginLocation.Latitude,
                                        Longitude = package.OriginLocation.Longitude
                                    }
                                    : null
                            });
                        }
                    }

                    return new ShipmentReply
                    {
                        ShipmentId = updatedShipment.Id.ToString(),
                        DriverId = updatedShipment.DriverId ?? "",
                        Status = updatedShipment.Status.HasValue
                            ? (TrackAndTraceGrpc.Status)updatedShipment.Status.Value
                            : TrackAndTraceGrpc.Status.Pending,
                        Type = updatedShipment.Type.HasValue
                            ? (TrackAndTraceGrpc.Type)updatedShipment.Type.Value
                            : TrackAndTraceGrpc.Type.Tdelivery,
                        Date = updatedShipment.Date.ToString(),
                        RouteHistory = { routeHistory },
                        CurrentLocation = updatedShipment.CurrentLocation != null
                            ? new TrackAndTraceGrpc.GrpcGeoLocation
                            {
                                Latitude = updatedShipment.CurrentLocation.Latitude,
                                Longitude = updatedShipment.CurrentLocation.Longitude
                            }
                            : null,
                        Packages = { packagesGrpc }
                    };
                }
            }
            else
            {
                // 
                // Packages delivered or picked up
                // 
                if (shipment.Type == Models.Helpers.Type.Delivery)
                {
                    var packagesToDeliver = new List<TrackAndTraceGrpc.Package>();
                    

                    foreach (var package in packagesResolvePurpose)
                    {
                        if (package.Status == Models.Helpers.Status.Delivered)
                        {
                            Console.WriteLine($"Package {package.Id} already delivered.");
                            continue;
                        }

                        // If current location == delivery location
                        if (package.DestinationLocation.Latitude == request.CurrentLocation.Latitude &&
                            package.DestinationLocation.Longitude == request.CurrentLocation.Longitude)
                        {
                            package.Status = Models.Helpers.Status.Delivered;
                            package.CurrentLocation = new Models.Helpers.GeoLocation
                            {
                                Latitude = request.CurrentLocation.Latitude,
                                Longitude = request.CurrentLocation.Longitude
                            };
                            package.TrackingHistory.Add(new TrackAndTrace.Models.Stage
                            {
                                Date = _timeService.Now,
                                GeoLocation = new Models.Helpers.GeoLocation
                                {
                                    Latitude = package.CurrentLocation.Latitude,
                                    Longitude = package.CurrentLocation.Longitude
                                },
                                Status = Models.Helpers.Status.Delivered
                            });

                            // Fire-and-forget DB & WS
                            _ = _packageRepo.UpdatePackage(package);
                            _updateQueue.Enqueue(package);
                            _ = _webSocketPublisher.PublishAsync($"package/{package.Id}", package);

                            // Add to packagesToDeliver
                            packagesToDeliver.Add(new TrackAndTraceGrpc.Package
                            {
                                Id = package.Id.ToString(),
                                Status = (TrackAndTraceGrpc.Status)package.Status,
                                DestinationStreet = package.DestinationStreet,
                                DestinationCountry = package.DestinationCountry,
                                DestinationNumber = package.DestinationNumber,
                                DestinationRegionCode = package.DestinationRegionCode,
                                OriginAddress = package.OriginAdress,
                                Date = package.Date.ToString(),
                                CurrentLocation = package.CurrentLocation != null
                                    ? new TrackAndTraceGrpc.GrpcGeoLocation
                                    {
                                        Latitude = package.CurrentLocation.Latitude,
                                        Longitude = package.CurrentLocation.Longitude
                                    }
                                    : null,
                                DestinationLocation = package.DestinationLocation != null
                                    ? new TrackAndTraceGrpc.GrpcGeoLocation
                                    {
                                        Latitude = package.DestinationLocation.Latitude,
                                        Longitude = package.DestinationLocation.Longitude
                                    }
                                    : null,
                                OriginLocation = package.OriginLocation != null
                                    ? new TrackAndTraceGrpc.GrpcGeoLocation
                                    {
                                        Latitude = package.OriginLocation.Latitude,
                                        Longitude = package.OriginLocation.Longitude
                                    }
                                    : null
                            });
                        }else{
                            // check if delivered if so skip if not update to intransit
                            if (package.Status != Models.Helpers.Status.Delivered)
                            {
                                package.Status = Models.Helpers.Status.InTransit;
                                package.CurrentLocation = new Models.Helpers.GeoLocation
                                {
                                    Latitude = request.CurrentLocation.Latitude,
                                    Longitude = request.CurrentLocation.Longitude
                                };
                                package.TrackingHistory.Add(new TrackAndTrace.Models.Stage
                                {
                                    Date = _timeService.Now,
                                    GeoLocation = new Models.Helpers.GeoLocation
                                    {
                                        Latitude = package.CurrentLocation.Latitude,
                                        Longitude = package.CurrentLocation.Longitude
                                    },
                                    Status = Models.Helpers.Status.InTransit
                                });

                                // Fire-and-forget DB & WS
                                _ = _packageRepo.UpdatePackage(package);
                                _updateQueue.Enqueue(package);
                                _ = _webSocketPublisher.PublishAsync($"package/{package.Id}", package);
                            }
                        }
                    }

                    // Update shipment VARIABLE
                    shipment.Date = _timeService.Now;
                    shipment.CurrentLocation = new Models.Helpers.GeoLocation
                    {
                        Latitude = request.CurrentLocation.Latitude,
                        Longitude = request.CurrentLocation.Longitude
                    };
                    shipment.Status = Models.Helpers.Status.InTransit;
                    shipment.RouteHistory.Add(new TrackAndTrace.Models.Helpers.GeoLocationWithDate
                    {
                        Date = _timeService.Now,
                        Latitude = shipment.CurrentLocation.Latitude,
                        Longitude = shipment.CurrentLocation.Longitude
                    });

                    // Package state
                    var packagesLatest = new List<TrackAndTraceGrpc.Package>();
                    if (shipment.PackagesIds != null)
                    {
                        foreach (var packageId in shipment.PackagesIds)
                        {
                            var packageNew = await _packageRepo.GetPackage(packageId);
                            packagesLatest.Add(new TrackAndTraceGrpc.Package
                            {
                                Id = packageNew.Id.ToString(),
                                Status = (TrackAndTraceGrpc.Status)packageNew.Status,
                                DestinationStreet = packageNew.DestinationStreet,
                                DestinationCountry = packageNew.DestinationCountry,
                                DestinationNumber = packageNew.DestinationNumber,
                                DestinationRegionCode = packageNew.DestinationRegionCode,
                                OriginAddress = packageNew.OriginAdress,
                                Date = packageNew.Date.ToString(),
                                CurrentLocation = packageNew.CurrentLocation != null
                                    ? new TrackAndTraceGrpc.GrpcGeoLocation
                                    {
                                        Latitude = packageNew.CurrentLocation.Latitude,
                                        Longitude = packageNew.CurrentLocation.Longitude
                                    }
                                    : null,
                                DestinationLocation = packageNew.DestinationLocation != null
                                    ? new TrackAndTraceGrpc.GrpcGeoLocation
                                    {
                                        Latitude = packageNew.DestinationLocation.Latitude,
                                        Longitude = packageNew.DestinationLocation.Longitude
                                    }
                                    : null,
                                OriginLocation = packageNew.OriginLocation != null
                                    ? new TrackAndTraceGrpc.GrpcGeoLocation
                                    {
                                        Latitude = packageNew.OriginLocation.Latitude,
                                        Longitude = packageNew.OriginLocation.Longitude
                                    }
                                    : null

                            
                            });

                            // add to packagesLatest

                        }
                    }

                    // packages delivered = shipment delivered
                    if (packagesLatest.All(x => x.Status == TrackAndTraceGrpc.Status.Delivered))
                    {
                        shipment.Status = Models.Helpers.Status.Delivered;
                        shipment.CurrentLocation = new Models.Helpers.GeoLocation
                        {
                            Latitude = 50.82444524562267,
                            Longitude = 3.2513378626369978
                        };

                        shipment.RouteHistory.Add(new TrackAndTrace.Models.Helpers.GeoLocationWithDate
                        {
                            Date = _timeService.Now,
                            Latitude = shipment.CurrentLocation.Latitude,
                            Longitude = shipment.CurrentLocation.Longitude
                        });

                        var driver = await _driverRepo.GetDriver(shipment.DriverId);
                        if (driver != null)
                        {
                            driver.ShipmentsIds.Remove(shipment.Id);
                            // Fire-and-forget
                            _ = _driverRepo.UpdateDriver(driver);
                            _driverUpdateQueue.Enqueue(driver);
                        }
                    }

                    var finalShipment = shipment;
                    _ = _shipmentRepo.UpdateShipment(shipment);
                    _shipmentUpdateQueue.Enqueue(finalShipment);
                    _ = _webSocketPublisher.PublishShipmentAsync($"shipment/{finalShipment.Id}", finalShipment);

                    var routeHistory = finalShipment.RouteHistory?
                        .Select(x => new TrackAndTraceGrpc.GeoLocationWithDate
                        {
                            Date = x.Date.ToString(),
                            Latitude = x.Latitude,
                            Longitude = x.Longitude
                        }).ToList() ?? new List<TrackAndTraceGrpc.GeoLocationWithDate>();
                    
                    

                    return new ShipmentReply
                    {
                        ShipmentId = finalShipment.Id.ToString(),
                        DriverId = finalShipment.DriverId ?? "",
                        Status = (TrackAndTraceGrpc.Status)finalShipment.Status.Value,
                        Type = (TrackAndTraceGrpc.Type)finalShipment.Type.Value,
                        Date = finalShipment.Date.ToString(),
                        RouteHistory = { routeHistory },
                        CurrentLocation = finalShipment.CurrentLocation != null
                            ? new TrackAndTraceGrpc.GrpcGeoLocation
                            {
                                Latitude = finalShipment.CurrentLocation.Latitude,
                                Longitude = finalShipment.CurrentLocation.Longitude
                            }
                            : null,
                        Packages = { packagesLatest },
                        PackagesToDropOff = { packagesToDeliver }
                    };

                }
                else if (shipment.Type == Models.Helpers.Type.Pickup)
                {
                    var packagesToPickup = new List<TrackAndTraceGrpc.Package>();

                    Console.WriteLine($"Count of packagesResolvePurpose: {packagesResolvePurpose.Count}");
                    Console.WriteLine($"Packages with null entries: {packagesResolvePurpose.Count(p => p == null)}");


                    foreach (var package in packagesResolvePurpose)
                    {
                        if (package.Status == Models.Helpers.Status.Sorting)
                        {
                            Console.WriteLine($"Package {package.Id} already picked up.");
                            continue;
                        }
                        
                        if (package.OriginLocation.Latitude == request.CurrentLocation.Latitude &&
                            package.OriginLocation.Longitude == request.CurrentLocation.Longitude)
                        {
                            package.Status = Models.Helpers.Status.Sorting;
                            package.CurrentLocation = new Models.Helpers.GeoLocation
                            {
                                Latitude = 50.82444524562267,
                                Longitude = 3.2513378626369978
                            };
                            package.TrackingHistory.Add(new TrackAndTrace.Models.Stage
                            {
                                Date = _timeService.Now,
                                GeoLocation = new Models.Helpers.GeoLocation
                                {
                                    Latitude = 50.82444524562267,
                                    Longitude = 3.2513378626369978
                                },
                                Status = Models.Helpers.Status.Sorting
                            });

                            // Fire-and-forget

                            // await the update
                            await _packageRepo.UpdatePackage(package);
                            // _ = _packageRepo.UpdatePackage(package);
                            _updateQueue.Enqueue(package);
                            _queue.Enqueue(package); // sorting queue
                            _ = _webSocketPublisher.PublishAsync($"package/{package.Id}", package);

                            packagesToPickup.Add(new TrackAndTraceGrpc.Package
                            {
                                Id = package.Id.ToString(),
                                Status = (TrackAndTraceGrpc.Status)package.Status,
                                DestinationStreet = package.DestinationStreet,
                                DestinationCountry = package.DestinationCountry,
                                DestinationNumber = package.DestinationNumber,
                                DestinationRegionCode = package.DestinationRegionCode,
                                OriginAddress = package.OriginAdress,
                                Date = package.Date.ToString(),
                                CurrentLocation = package.CurrentLocation != null
                                    ? new TrackAndTraceGrpc.GrpcGeoLocation
                                    {
                                        Latitude = package.CurrentLocation.Latitude,
                                        Longitude = package.CurrentLocation.Longitude
                                    }
                                    : null,
                                DestinationLocation = package.DestinationLocation != null
                                    ? new TrackAndTraceGrpc.GrpcGeoLocation
                                    {
                                        Latitude = package.DestinationLocation.Latitude,
                                        Longitude = package.DestinationLocation.Longitude
                                    }
                                    : null,
                                OriginLocation = package.OriginLocation != null
                                    ? new TrackAndTraceGrpc.GrpcGeoLocation
                                    {
                                        Latitude = package.OriginLocation.Latitude,
                                        Longitude = package.OriginLocation.Longitude
                                    }
                                    : null
                            });

                        }
                        else{
                            // check if delivered if so skip if not update to intransit
                            if (package.Status != Models.Helpers.Status.Sorting)
                            {
                                package.Status = Models.Helpers.Status.InTransit;
                                package.CurrentLocation = new Models.Helpers.GeoLocation
                                {
                                    Latitude = request.CurrentLocation.Latitude,
                                    Longitude = request.CurrentLocation.Longitude
                                };
                                package.TrackingHistory.Add(new TrackAndTrace.Models.Stage
                                {
                                    Date = _timeService.Now,
                                    GeoLocation = new Models.Helpers.GeoLocation
                                    {
                                        Latitude = package.CurrentLocation.Latitude,
                                        Longitude = package.CurrentLocation.Longitude
                                    },
                                    Status = Models.Helpers.Status.InTransit
                                });

                                // Fire-and-forget DB & WS
                                _ = _packageRepo.UpdatePackage(package);
                                _updateQueue.Enqueue(package);
                                _ = _webSocketPublisher.PublishAsync($"package/{package.Id}", package);
                            }
                        }
                    };

                    // Update shipment (in memory)
                    shipment.Date = _timeService.Now;
                    shipment.CurrentLocation = new Models.Helpers.GeoLocation
                    {
                        Latitude = request.CurrentLocation.Latitude,
                        Longitude = request.CurrentLocation.Longitude
                    };
                    shipment.Status = Models.Helpers.Status.InTransit;
                    shipment.RouteHistory.Add(new TrackAndTrace.Models.Helpers.GeoLocationWithDate
                    {
                        Date = _timeService.Now,
                        Latitude = shipment.CurrentLocation.Latitude,
                        Longitude = shipment.CurrentLocation.Longitude
                    });

                    var packagesLatest = new List<TrackAndTraceGrpc.Package>();
                    if (shipment.PackagesIds != null)
                    {
                        foreach (var packageId in shipment.PackagesIds)
                        {
                            var packageNew = await _packageRepo.GetPackage(packageId);
                            packagesLatest.Add(new TrackAndTraceGrpc.Package
                            {
                                Id = packageNew.Id.ToString(),
                                Status = (TrackAndTraceGrpc.Status)packageNew.Status,
                                DestinationStreet = packageNew.DestinationStreet,
                                DestinationCountry = packageNew.DestinationCountry,
                                DestinationNumber = packageNew.DestinationNumber,
                                DestinationRegionCode = packageNew.DestinationRegionCode,
                                OriginAddress = packageNew.OriginAdress,
                                Date = packageNew.Date.ToString(),
                                CurrentLocation = packageNew.CurrentLocation != null
                                    ? new TrackAndTraceGrpc.GrpcGeoLocation
                                    {
                                        Latitude = packageNew.CurrentLocation.Latitude,
                                        Longitude = packageNew.CurrentLocation.Longitude
                                    }
                                    : null,
                                DestinationLocation = packageNew.DestinationLocation != null
                                    ? new TrackAndTraceGrpc.GrpcGeoLocation
                                    {
                                        Latitude = packageNew.DestinationLocation.Latitude,
                                        Longitude = packageNew.DestinationLocation.Longitude
                                    }
                                    : null,

                                OriginLocation = packageNew.OriginLocation != null
                                    ? new TrackAndTraceGrpc.GrpcGeoLocation
                                    {
                                        Latitude = packageNew.OriginLocation.Latitude,
                                        Longitude = packageNew.OriginLocation.Longitude
                                    }
                                    : null
                            });
                        }
                    }

                    if (packagesLatest.All(x => x.Status == TrackAndTraceGrpc.Status.Delivered))
                    {
                        shipment.Status = Models.Helpers.Status.Delivered;
                        shipment.CurrentLocation = new Models.Helpers.GeoLocation
                        {
                            Latitude = 50.82444524562267,
                            Longitude = 3.2513378626369978
                        };
                        shipment.RouteHistory.Add(new TrackAndTrace.Models.Helpers.GeoLocationWithDate
                        {
                            Date = _timeService.Now,
                            Latitude = shipment.CurrentLocation.Latitude,
                            Longitude = shipment.CurrentLocation.Longitude
                        });

                        var driver = await _driverRepo.GetDriver(shipment.DriverId);
                        if (driver != null)
                        {
                            driver.ShipmentsIds.Remove(shipment.Id);
                            // Fire-and-forget
                            _ = _driverRepo.UpdateDriver(driver);
                            _driverUpdateQueue.Enqueue(driver);
                        }
                    }

                    if (packagesLatest.All(x => x.Status == TrackAndTraceGrpc.Status.Sorting))
                    {
                        shipment.Status = Models.Helpers.Status.Delivered;
                        shipment.CurrentLocation = new Models.Helpers.GeoLocation
                        {
                            Latitude = 50.82444524562267,
                            Longitude = 3.2513378626369978
                        };
                        shipment.RouteHistory.Add(new TrackAndTrace.Models.Helpers.GeoLocationWithDate
                        {
                            Date = _timeService.Now,
                            Latitude = shipment.CurrentLocation.Latitude,
                            Longitude = shipment.CurrentLocation.Longitude
                        });

                        var driver = await _driverRepo.GetDriver(shipment.DriverId);
                        if (driver != null)
                        {
                            driver.PickupsIds.Remove(shipment.Id);
                            // Fire-and-forget
                            _ = _driverRepo.UpdateDriver(driver);
                            _driverUpdateQueue.Enqueue(driver);
                        }



                    };

                    // cast value to grpc enum
                    var finalShipment = shipment;
                    _ = _shipmentRepo.UpdateShipment(shipment);
                    _shipmentUpdateQueue.Enqueue(finalShipment);
                    _ = _webSocketPublisher.PublishShipmentAsync($"shipment/{finalShipment.Id}", finalShipment);

                    var routeHistory = finalShipment.RouteHistory?
                        .Select(x => new TrackAndTraceGrpc.GeoLocationWithDate
                        {
                            Date = x.Date.ToString(),
                            Latitude = x.Latitude,
                            Longitude = x.Longitude
                        }).ToList() ?? new List<TrackAndTraceGrpc.GeoLocationWithDate>();

                    Console.WriteLine("Shipment status:" + finalShipment.Status.Value);
                    Console.WriteLine("Casted GRPc status:" + (TrackAndTraceGrpc.Status)finalShipment.Status.Value);

                    return new ShipmentReply
                    {

                        DriverId = finalShipment.DriverId ?? "",
                        Status = (TrackAndTraceGrpc.Status)finalShipment.Status.Value,
                        Type = (TrackAndTraceGrpc.Type)finalShipment.Type.Value,
                        Date = finalShipment.Date.ToString(),
                        RouteHistory = { routeHistory },
                        CurrentLocation = finalShipment.CurrentLocation != null
                            ? new TrackAndTraceGrpc.GrpcGeoLocation
                            {
                                Latitude = finalShipment.CurrentLocation.Latitude,
                                Longitude = finalShipment.CurrentLocation.Longitude
                            }
                            : null,
                        Packages = { packagesLatest },
                        PackagesToDropOff = { packagesToPickup }
                    };

                }
                else
                {
                    // If nothing matched above
                    throw new RpcException(new Grpc.Core.Status(StatusCode.InvalidArgument, "Invalid shipment type"));
                }
            }
        }


        // If nothing matched above
        Console.WriteLine($"Invalid status or location: NewStatus={request.NewStatus}, CurrentLocation={request.CurrentLocation}");
        throw new RpcException(new Grpc.Core.Status(StatusCode.InvalidArgument, "Invalid status or location"));

    }



    public override async Task<ShipmentListReply> GetShipmentsByDriverId(GetShipmentsByDriverIdRequest request, ServerCallContext context)
    {
        var shipments = await _shipmentRepo.GetShipmentsByDriverId(request.DriverId);

        var shipmentReplies = new List<ShipmentReply>();

        foreach (var shipment in shipments)
        {
            var routeHistory = shipment.RouteHistory?.Select(x =>
                new TrackAndTraceGrpc.GeoLocationWithDate
                {
                    Date = x.Date.ToString(),
                    Latitude = x.Latitude,
                    Longitude = x.Longitude
                }).ToList() ?? new List<TrackAndTraceGrpc.GeoLocationWithDate>();

            var packages = new List<TrackAndTraceGrpc.Package>();

            if (shipment.PackagesIds != null)
            {
                foreach (var packageId in shipment.PackagesIds)
                {
                    var package = await _packageRepo.GetPackage(packageId);
                    if (package != null)
                    {
                        packages.Add(new TrackAndTraceGrpc.Package
                        {
                            Id = package.Id.ToString(),
                            Status = (TrackAndTraceGrpc.Status)package.Status,
                            DestinationStreet = package.DestinationStreet,
                            DestinationCountry = package.DestinationCountry,
                            DestinationNumber = package.DestinationNumber,
                            DestinationRegionCode = package.DestinationRegionCode,
                            OriginAddress = package.OriginAdress,
                            Date = package.Date.ToString(),
                            CurrentLocation = package.CurrentLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
                            {
                                Latitude = package.CurrentLocation.Latitude,
                                Longitude = package.CurrentLocation.Longitude
                            } : null,
                            DestinationLocation = package.DestinationLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
                            {
                                Latitude = package.DestinationLocation.Latitude,
                                Longitude = package.DestinationLocation.Longitude
                            } : null,
                            OriginLocation = package.OriginLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
                            {
                                Latitude = package.OriginLocation.Latitude,
                                Longitude = package.OriginLocation.Longitude
                            } : null
                        });
                    }
                }
            }

            shipmentReplies.Add(new ShipmentReply
            {
                ShipmentId = shipment.Id.ToString(),
                DriverId = shipment.DriverId ?? "",
                Status = shipment.Status.HasValue ? (TrackAndTraceGrpc.Status)shipment.Status.Value : TrackAndTraceGrpc.Status.Pending,
                Type = shipment.Type.HasValue ? (TrackAndTraceGrpc.Type)shipment.Type.Value : TrackAndTraceGrpc.Type.Tdelivery,
                Date = shipment.Date.ToString(),
                RouteHistory = { routeHistory },
                CurrentLocation = shipment.CurrentLocation != null ? new TrackAndTraceGrpc.GrpcGeoLocation
                {
                    Latitude = shipment.CurrentLocation.Latitude,
                    Longitude = shipment.CurrentLocation.Longitude
                } : null,
                Packages = { packages }
            });
        }

        return new ShipmentListReply
        {
            Shipments = { shipmentReplies }
        };

    }

}