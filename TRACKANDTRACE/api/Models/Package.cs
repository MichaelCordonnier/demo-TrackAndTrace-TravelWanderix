namespace TrackAndTrace.Models;

public class Package
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }
    public string? DestinationStreet { get; set; }

    public string? DestinationCountry { get; set; }

    public string? DestinationNumber { get; set; }

    public string? DestinationRegionCode { get; set; }

    public List<Stage>? TrackingHistory { get; set; }

    public string? OriginAdress { get; set; }
    public Helpers.Status Status { get; set; }
    public DateTime Date { get; set; }

    public GeoLocation? CurrentLocation { get; set; }

    public GeoLocation? DestinationLocation { get; set; }

    public GeoLocation? OriginLocation { get; set; }
}