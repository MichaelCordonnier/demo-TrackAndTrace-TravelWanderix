using System.Collections.Concurrent;
using System.Threading.Tasks;
using MongoDB.Driver;
using TrackAndTrace.Context;
using TrackAndTrace.Repo.Packages;


public class PackageEventArgs : EventArgs
{
    public Package Package { get; }

    public PackageEventArgs(Package package)
    {
        Package = package;
    }
}


public class PackageQueue
{
    private readonly ConcurrentQueue<Package> _packageQueue = new();
    private readonly SemaphoreSlim _signal = new(0);
    private readonly IRepoPackages _packageRepo;

    public event EventHandler<PackageEventArgs> PackageReceived;


    public PackageQueue(IRepoPackages packageRepo)
    {
        _packageRepo = packageRepo;
    }

    public async Task Init()
    {
        var packages = await _packageRepo.RestorePackagesForQueue();
        foreach (var package in packages)
        {
            Enqueue(package);
        }
        Console.WriteLine("Queue initialized with all packages.");
    }

    public void Enqueue(Package package)
    {
        _packageQueue.Enqueue(package);
        _signal.Release();
        Console.WriteLine($"Package with ID {package.Id} enqueued.");
        OnPackageReceived(package);
    }

    public async Task<Package> DequeueAsync(TimeSpan timeout)
    {
        if (await _signal.WaitAsync(timeout))
        {
            if (_packageQueue.TryDequeue(out var package))
            {
                Console.WriteLine($"Package with ID {package.Id} dequeued.");
                return package;
            }
        }

        Console.WriteLine("Dequeue operation timed out.");
        return null;
    }

    public bool Contains(Package package)
    {
        bool contains = _packageQueue.Any(p => p.Id == package.Id);
        Console.WriteLine($"Package with ID {package.Id} is in queue: {contains}");
        return contains;
    }

    public async Task<List<Package>> GetAllPackagesAsync()
    {
        var packages = new List<Package>();
        while (_packageQueue.TryDequeue(out var package))
        {
            packages.Add(package);
            await Task.Yield(); // Yield to keep the method asynchronous
        }
        Console.WriteLine($"{packages.Count} packages retrieved from the queue.");
        return packages;
    }

    public void Dequeue(string packageId)
    {
        var package = _packageQueue.FirstOrDefault(p => p.Id == packageId);
        if (package != null)
        {
            _packageQueue.TryDequeue(out _);
            Console.WriteLine($"Package with ID {package.Id} dequeued.");
        }
        else
        {
            Console.WriteLine($"Package with ID {packageId} not found in the queue.");
        }
    }

    protected virtual void OnPackageReceived(Package package)
    {
        PackageReceived?.Invoke(this, new PackageEventArgs(package));
    }
    
}