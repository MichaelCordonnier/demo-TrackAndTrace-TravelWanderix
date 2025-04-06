using TrackAndTrace.Context;
namespace TrackAndTrace.Repo.Packages;

public interface IRepoPackages
{
    Task<List<Package>> GetPackages();

    Task<Package> GetPackage(string id);

    Task<List<Package>> GetPackagesByIds(List<string> ids);

    Task<Package> AddPackage(Package package);

    Task<Package> UpdatePackage(Package package);

    Task<Package> DeletePackage(string id);

    Task<List<Package>> RestorePackagesForQueue();
}

public class PackageRepo : IRepoPackages
{
    private readonly IMongoContext _context;

    public PackageRepo(IMongoContext context)
    {
        _context = context;
    }

    public async Task<Package> AddPackage(Package package)
    {
        await _context.GetCollection<Package>("Packages").InsertOneAsync(package);
        return package;
    }

    public async Task<Package> DeletePackage(string id)
    {

        var objectId = new ObjectId(id.ToString());
        return await _context.GetCollection<Package>("Packages").FindOneAndDeleteAsync(x => x.Id == objectId.ToString());
    }

    public async Task<Package> GetPackage(string id)
    {
        var objectId = new ObjectId(id.ToString());
        return await _context.GetCollection<Package>("Packages").Find(x => x.Id == objectId.ToString()).FirstOrDefaultAsync();
    }

    public async Task<List<Package>> GetPackages()
    {
        return await _context.GetCollection<Package>("Packages").Find(_ => true).ToListAsync();
    }

    public async Task<Package> UpdatePackage(Package package)
    {
        var filter = Builders<Package>.Filter.Eq(x => x.Id, package.Id);
        var result = await _context.GetCollection<Package>("Packages").ReplaceOneAsync(filter, package);
        return result.IsAcknowledged && result.ModifiedCount > 0 ? package : null;

    }

    public async Task<List<Package>> GetPackagesByIds(List<string> ids)
    {
        var objectIds = ids.Select(id => new ObjectId(id.ToString())).ToList();
        return await _context.GetCollection<Package>("Packages").Find(x => objectIds.Contains(new ObjectId(x.Id))).ToListAsync();
    }

    public async Task<List<Package>> RestorePackagesForQueue()
    {
        var packages = await _context.GetCollection<Package>("Packages")
            .Find(x => x.Status == Models.Helpers.Status.Pending || x.Status == Models.Helpers.Status.Sorting)
            .ToListAsync();

        return packages;
    }
}

