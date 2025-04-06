using TrackAndTrace.Repo.Drivers;
using TrackAndTraceGrpc;
using TrackAndTrace.Models;
using Grpc.Core;

namespace TrackAndTrace.GrpcServices;

public class DriverService : DriverProto.DriverProtoBase
{
    private readonly IRepoDriver _driverRepo;
    private readonly DriverUpdateQueue _updateQueue;

    public DriverService(IRepoDriver driverRepo, DriverUpdateQueue updateQueue)
    {
        _driverRepo = driverRepo;
        _updateQueue = updateQueue;
    }

    // AddDriver Implementation
    public override async Task<DriverReply> AddDriver(DriverRequest request, ServerCallContext context)
    {
        var driver = new Driver
        {
            Name = request.Name,
            PhoneNumber = request.PhoneNumber,
            Email = request.Email,
            Status = (WorkerStatus)request.Status,
            Shipments = new List<Shipment>(),
            Pickups = new List<Shipment>(),
            ShipmentsIds = new List<string>(),
            PickupsIds = new List<string>(),
        };

        var addedDriver = await _driverRepo.AddDriver(driver);

        _updateQueue.Enqueue(addedDriver);

        return new DriverReply
        {
            Id = addedDriver.Id.ToString(),
            Name = addedDriver.Name,
            PhoneNumber = addedDriver.PhoneNumber,
            Email = addedDriver.Email,
            Status = (TrackAndTraceGrpc.WorkerStatus)addedDriver.Status
        };
    }

    // GetDriver Implementation
    public override async Task<DriverReply> GetDriver(DriverIdRequest request, ServerCallContext context)
    {
        var driver = await _driverRepo.GetDriver(request.Id);

        if (driver == null)
        {
            throw new RpcException(new Grpc.Core.Status(StatusCode.NotFound, "Driver not found"));
        }

        return new DriverReply
        {
            Id = driver.Id.ToString(),
            Name = driver.Name,
            PhoneNumber = driver.PhoneNumber,
            Email = driver.Email,
            Status = (TrackAndTraceGrpc.WorkerStatus)driver.Status
        };
    }

    // GetDrivers Implementation
    public override async Task<DriverListReply> GetDrivers(Empty request, ServerCallContext context)
    {
        var drivers = await _driverRepo.GetDrivers();

        var driverReplies = drivers.Select(driver => new DriverReply
        {
            Id = driver.Id.ToString(),
            Name = driver.Name,
            PhoneNumber = driver.PhoneNumber,
            Email = driver.Email,
            Status = (TrackAndTraceGrpc.WorkerStatus)driver.Status
        });

        return new DriverListReply
        {
            Drivers = { driverReplies }
        };
    }

    // UpdateDriver Implementation
    public override async Task<DriverReply> UpdateDriver(DriverUpdateRequest request, ServerCallContext context)
    {
        var driver = await _driverRepo.GetDriver(request.Id);

        if (driver == null)
        {
            throw new RpcException(new Grpc.Core.Status(StatusCode.NotFound, "Driver not found"));
        }

        driver.Status = (WorkerStatus)request.Status;

        Console.WriteLine($"Updating driver: {driver.Status}");

        var updatedDriver = await _driverRepo.UpdateDriver(driver);

        Console.WriteLine($"Updated driver: {updatedDriver.Status}");

        _updateQueue.Enqueue(updatedDriver);

        return new DriverReply
        {
            Id = updatedDriver.Id.ToString(),
            Name = updatedDriver.Name,
            PhoneNumber = updatedDriver.PhoneNumber,
            Email = updatedDriver.Email,
            Status = (TrackAndTraceGrpc.WorkerStatus)updatedDriver.Status
        };
    }
}
