using TrackAndTrace.Repo.Packages;
using TrackAndTrace.TimeProvider;
using TrackAndTraceGrpc;

namespace TrackAndTrace.GrpcServices;

public class PackageService : PackageProto.PackageProtoBase
{
    private readonly IRepoPackages _packageRepo;

    // sorting queue 
    private readonly PackageQueue _queue;

    // websocket queue 
    private readonly PackageUpdateQueue _updateQueue;

    private readonly ITimeService _timeService;


    public PackageService(IRepoPackages packageRepo, PackageQueue queue, PackageUpdateQueue updateQueue, ITimeService timeService)
    {
        _packageRepo = packageRepo;
        _queue = queue;
        _updateQueue = updateQueue;
        _timeService = timeService;
    }


    public override async Task<PackageReply> AddPackage(PackageRequest request, ServerCallContext context)
    {
        var package = new TrackAndTrace.Models.Package
        {
            DestinationStreet = request.DestinationStreet,
            DestinationCountry = request.DestinationCountry,
            DestinationNumber = request.DestinationNumber,
            DestinationRegionCode = request.DestinationRegionCode,
            TrackingHistory = new List<TrackAndTrace.Models.Stage>(),
            OriginAdress = request.OriginAddress,
            Date = _timeService.Now,
            CurrentLocation = new Models.Helpers.GeoLocation
            {
                Latitude = request.CurrentLocation.Latitude,
                Longitude = request.CurrentLocation.Longitude
            },
            DestinationLocation = new Models.Helpers.GeoLocation
            {
                Latitude = request.DestinationLocation.Latitude,
                Longitude = request.DestinationLocation.Longitude
            },
            OriginLocation = new Models.Helpers.GeoLocation
            {
                Latitude = request.OriginLocation.Latitude,
                Longitude = request.OriginLocation.Longitude
            },
        };

        package.Status = Models.Helpers.Status.Pending;

        // add a new stage 
        package.TrackingHistory.Add(new TrackAndTrace.Models.Stage
        {
            Date = _timeService.Now,
            GeoLocation = new Models.Helpers.GeoLocation
            {
                Latitude = request.CurrentLocation.Latitude,
                Longitude = request.CurrentLocation.Longitude
            },
            Status = 0,
        });

        var addedPackage = await _packageRepo.AddPackage(package);

        _updateQueue.Enqueue(addedPackage);
        _queue.Enqueue(addedPackage);

        return new PackageReply
        {
            Id = addedPackage.Id.ToString(),
            DestinationStreet = addedPackage.DestinationStreet,
            DestinationCountry = addedPackage.DestinationCountry,
            DestinationNumber = addedPackage.DestinationNumber,
            DestinationRegionCode = addedPackage.DestinationRegionCode,
            OriginAddress = addedPackage.OriginAdress,
            Status = (TrackAndTraceGrpc.Status)addedPackage.Status,
            Date = addedPackage.Date.ToString(),
            CurrentLocation = new TrackAndTraceGrpc.GrpcGeoLocation
            {
                Latitude = addedPackage.CurrentLocation.Latitude,
                Longitude = addedPackage.CurrentLocation.Longitude
            },
            DestinationLocation = new TrackAndTraceGrpc.GrpcGeoLocation
            {
                Latitude = addedPackage.DestinationLocation.Latitude,
                Longitude = addedPackage.DestinationLocation.Longitude
            },
            OriginLocation = new TrackAndTraceGrpc.GrpcGeoLocation
            {
                Latitude = addedPackage.OriginLocation.Latitude,
                Longitude = addedPackage.OriginLocation.Longitude
            },

        };
    }


    public override async Task<PackageReply> UpdatePackage(UpdatePackageRequest request, ServerCallContext context)
    {

        var package = await _packageRepo.GetPackage(request.Id);

        if (package == null)
        {
            throw new RpcException(new Grpc.Core.Status(StatusCode.NotFound, "Package not found"));
        }

        // first make also sure its not on the queue 
        if (_queue.Contains(package))
        {
            throw new RpcException(new Grpc.Core.Status(StatusCode.FailedPrecondition, "Package is still in queue"));
        }

        package.Status = (Models.Helpers.Status)request.Status;

        // this can only be done if the package is in transit
        if (package.Status == Models.Helpers.Status.InTransit)
        {
            package.CurrentLocation = package.DestinationLocation;
        }
        else
        {
            throw new RpcException(new Grpc.Core.Status(StatusCode.FailedPrecondition, "Package is not in transit"));
        }

        // add new stage to tracking history
        package.TrackingHistory.Add(new TrackAndTrace.Models.Stage
        {
            Date = _timeService.Now,
            GeoLocation = new Models.Helpers.GeoLocation
            {
                Latitude = package.CurrentLocation.Latitude,
                Longitude = package.CurrentLocation.Longitude
            },
            Status = (Models.Helpers.Status)request.Status
        });

        var updatedPackage = await _packageRepo.UpdatePackage(package);

        _updateQueue.Enqueue(updatedPackage);

        return new PackageReply
        {
            Id = updatedPackage.Id.ToString(),
            DestinationStreet = updatedPackage.DestinationStreet,
            DestinationCountry = updatedPackage.DestinationCountry,
            DestinationNumber = updatedPackage.DestinationNumber,
            DestinationRegionCode = updatedPackage.DestinationRegionCode,

            OriginAddress = updatedPackage.OriginAdress,
            Status = (TrackAndTraceGrpc.Status)updatedPackage.Status,
            Date = updatedPackage.Date.ToString(),
            CurrentLocation = new TrackAndTraceGrpc.GrpcGeoLocation
            {
                Latitude = updatedPackage.CurrentLocation.Latitude,
                Longitude = updatedPackage.CurrentLocation.Longitude
            },
            DestinationLocation = new TrackAndTraceGrpc.GrpcGeoLocation
            {
                Latitude = updatedPackage.DestinationLocation.Latitude,
                Longitude = updatedPackage.DestinationLocation.Longitude
            },
            TrackingHistory = { updatedPackage.TrackingHistory.Select(stage => new TrackAndTraceGrpc.Stage
                {
                    Date = stage.Date.ToString(),
                    Status = (TrackAndTraceGrpc.Status)stage.Status,
                    GeoLocation = new TrackAndTraceGrpc.GrpcGeoLocation
                    {
                        Latitude = stage.GeoLocation.Latitude,
                        Longitude = stage.GeoLocation.Longitude
                    }

                })},
            OriginLocation = new TrackAndTraceGrpc.GrpcGeoLocation
            {
                Latitude = updatedPackage.OriginLocation.Latitude,
                Longitude = updatedPackage.OriginLocation.Longitude
            },
        };

    }

}