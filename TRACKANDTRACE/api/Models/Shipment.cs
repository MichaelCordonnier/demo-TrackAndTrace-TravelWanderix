namespace TrackAndTrace.Models;

public class Shipment
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }

    public string? DriverId { get; set; }

    public Driver? Driver { get; set; }

    public Helpers.Status? Status { get; set; }

    public Helpers.Type? Type { get; set; }

    public DateTime Date { get; set; }

    public List<GeoLocationWithDate>? RouteHistory { get; set; }

    public GeoLocation? CurrentLocation { get; set; }

    public List<string>? PackagesIds { get; set; }

    public List<Package>? Packages { get; set; }

}