using TrackAndTrace.Repo.Drivers;
using TrackAndTrace.TimeProvider;
using System.Threading.Tasks;
using System.Threading;
using TrackAndTrace.Repo.Packages;
using TrackAndTrace.Repo.Shipments;

namespace TrackAndTrace.Service.Dashboard;

public interface IDashboardService
{
    Task<IEnumerable<Driver>> GetDrivers();
    Task<DateTime> GetCurrentTimeAsync();

    Task<List<Package>> GetPackages();

    Task<List<Shipment>> GetShipments();  

    Task<Shipment> GetShipmentById(string id);

    Task<Package> GetPackageById(string id);  
}

public class DashboardService : IDashboardService
{
    private readonly IRepoDriver _repoDriver;

    private readonly IRepoPackages _repoPackages;

    private readonly IRepoShipment _repoShipment;

    private readonly ITimeService _timeService;
    private readonly IWebSocketPublisher _webSocketPublisher;
    private readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1, 1);

    public DashboardService(IRepoDriver repoDriver, ITimeService timeService, IRepoPackages repoPackages, IRepoShipment repoShipment)
    {
        _repoDriver = repoDriver;
        _timeService = timeService;
        _repoPackages = repoPackages;
        _repoShipment = repoShipment;
    }


    public async Task<IEnumerable<Driver>> GetDrivers()
    {
        return await _repoDriver.GetDrivers();
    }

    public Task<DateTime> GetCurrentTimeAsync()
    {
        return Task.FromResult(_timeService.Now);
    }

    public Task<List<Package>> GetPackages()
    {
        return _repoPackages.GetPackages();
    }

    public Task<List<Shipment>> GetShipments()
    {
        return _repoShipment.GetShipments();
    }

    public Task<Shipment> GetShipmentById(string id)
    {
        return _repoShipment.GetShipment(id);
    }

    public Task<Package> GetPackageById(string id)
    {
        return _repoPackages.GetPackage(id);
    }

}