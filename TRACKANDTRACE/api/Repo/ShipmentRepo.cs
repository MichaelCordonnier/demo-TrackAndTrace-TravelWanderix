using TrackAndTrace.Context;
namespace TrackAndTrace.Repo.Shipments;

public interface IRepoShipment
{

    Task<List<Shipment>> GetShipments();

    Task<Shipment> GetShipment(string id);

    Task<Shipment> AddShipment(Shipment shipment);

    Task<Shipment> UpdateShipment(Shipment shipment);

    Task<Shipment> DeleteShipment(string id);

    Task<List<Driver>> GetDriversWithoutShipmentTypeDelivery();

    Task<List<Driver>> GetDriversWithoutShipmentTypePickup();

    Task<List<Shipment>> GetShipmentsByDriverId(string driverId);

}

public class ShipmentRepo : IRepoShipment
{
    private readonly IMongoContext _context;

    public ShipmentRepo(IMongoContext context)
    {
        _context = context;
    }

    public async Task<Shipment> AddShipment(Shipment shipment)
    {
        await _context.GetCollection<Shipment>("Shipments").InsertOneAsync(shipment);
        return shipment;
    }

    public async Task<Shipment> DeleteShipment(string id)
    {
        var objectId = new ObjectId(id.ToString());

        return await _context.GetCollection<Shipment>("Shipments").FindOneAndDeleteAsync(x => x.Id == objectId.ToString());
    }

    public async Task<Shipment> GetShipment(string id)
    {
        var objectId = new ObjectId(id);
        return await _context.GetCollection<Shipment>("Shipments").Find(x => x.Id == objectId.ToString()).FirstOrDefaultAsync();
    }

    public async Task<List<Shipment>> GetShipments()
    {
        return await _context.GetCollection<Shipment>("Shipments").Find(_ => true).ToListAsync();
    }

    public async Task<Shipment> UpdateShipment(Shipment shipment)
    {
        var filter = Builders<Shipment>.Filter.Eq(x => x.Id, shipment.Id);

        var result = await _context.GetCollection<Shipment>("Shipments").ReplaceOneAsync(filter, shipment);
        return result.IsAcknowledged && result.ModifiedCount > 0 ? shipment : null;
    }

    public async Task<List<Driver>> GetDriversWithoutShipmentTypeDelivery()
    {
        var freeDrivers = await _context.GetCollection<Driver>("Drivers").Find(x => x.ShipmentsIds == null || x.ShipmentsIds.Count < 1).ToListAsync();
        var driversToRemove = new List<Driver>();

        // now resolve the shipment to see the type 
        foreach (var driver in freeDrivers)
        {
            if (driver.ShipmentsIds != null && driver.ShipmentsIds.Count > 1)
            {
                var shipmentId = driver.ShipmentsIds[0];
                var shipment = await _context.GetCollection<Shipment>("Shipments").Find(x => x.Id.ToString() == shipmentId.ToString()).FirstOrDefaultAsync();
                if (shipment.Type == Models.Helpers.Type.Delivery)
                {
                    driversToRemove.Add(driver);
                }
            }
        }

        foreach (var driver in driversToRemove)
        {
            freeDrivers.Remove(driver);
        }

        return freeDrivers;
    }

    public async Task<List<Driver>> GetDriversWithoutShipmentTypePickup()
    {
        var freeDrivers = await _context.GetCollection<Driver>("Drivers").Find(x => x.PickupsIds == null || x.PickupsIds.Count < 1).ToListAsync();
        var driversToRemove = new List<Driver>();

        // now resolve the shipment to see the type 
        foreach (var driver in freeDrivers)
        {
            if (driver.PickupsIds != null && driver.PickupsIds.Count > 1)
            {
                var pickupId = driver.PickupsIds[0];
                var shipment = await _context.GetCollection<Shipment>("Shipments").Find(x => x.Id.ToString() == pickupId.ToString()).FirstOrDefaultAsync();
                if (shipment.Type == Models.Helpers.Type.Pickup)
                {
                    driversToRemove.Add(driver);
                }
            }
        }

        foreach (var driver in driversToRemove)
        {
            freeDrivers.Remove(driver);
        }

        return freeDrivers;
    }

    public async Task<List<Shipment>> GetShipmentsByDriverId(string driverId)
    {
        var shipments = await _context.GetCollection<Shipment>("Shipments").Find(x => x.DriverId == driverId).ToListAsync();
        return shipments;
    }
}