
namespace TrackAndTrace.Models;

public class Driver
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }

    public string? Name { get; set; }

    public string? PhoneNumber { get; set; }

    public string? Email { get; set; }

    [BsonRepresentation(BsonType.String)]
    public WorkerStatus Status { get; set; }

    public List<string>? ShipmentsIds { get; set; }

    public List<Shipment>? Shipments { get; set; }

    public List<string>? PickupsIds { get; set; }

    public List<Shipment>? Pickups { get; set; }


}