
using TrackAndTrace.Context;
namespace TrackAndTrace.Repo.Drivers;


public interface IRepoDriver
{
    Task<List<Driver>> GetDrivers();

    Task<Driver> GetDriver(string id);

    Task<Driver> AddDriver(Driver driver);

    Task<Driver> UpdateDriver(Driver driver);

    Task<Driver> DeleteDriver(string id);
}

public class DriverRepo : IRepoDriver
{
    private readonly IMongoContext _context;


    public DriverRepo(IMongoContext context)
    {
        _context = context;
    }

    public async Task<Driver> AddDriver(Driver driver)
    {
        await _context.GetCollection<Driver>("Drivers").InsertOneAsync(driver);
        return driver;
    }

    public async Task<Driver> DeleteDriver(string id)
    {

        return await _context.GetCollection<Driver>("Drivers").FindOneAndDeleteAsync(x => x.Id == id);
    }

    public async Task<Driver> GetDriver(string id)
    {
        var objectId = new ObjectId(id);

        return await _context.GetCollection<Driver>("Drivers").Find(x => x.Id == objectId.ToString()).FirstOrDefaultAsync();

    }

    public async Task<List<Driver>> GetDrivers()
    {

        return await _context.GetCollection<Driver>("Drivers").Find(_ => true).ToListAsync();
    }

    public async Task<Driver> UpdateDriver(Driver driver)
    {
        var filter = Builders<Driver>.Filter.Eq(x => x.Id, driver.Id);
        var result = await _context.GetCollection<Driver>("Drivers").ReplaceOneAsync(filter, driver);
        return result.IsAcknowledged ? driver : null;
    }
}