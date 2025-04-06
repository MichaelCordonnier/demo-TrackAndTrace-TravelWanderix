namespace TrackAndTrace.Models.Helpers;

public enum Status
{
    [BsonRepresentation(BsonType.String)]
    Pending = 0,

    [BsonRepresentation(BsonType.String)]
    Pickup = 1,
    [BsonRepresentation(BsonType.String)]
    Sorting = 2,
    [BsonRepresentation(BsonType.String)]
    Sorted = 3,
    [BsonRepresentation(BsonType.String)]
    InTransit = 4,
    [BsonRepresentation(BsonType.String)]
    Delivered = 5,
}