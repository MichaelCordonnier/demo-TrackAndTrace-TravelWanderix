namespace TrackAndTrace.Models.Helpers;

public enum Type
{
    [BsonRepresentation(BsonType.String)]
    Pickup = 0,
    [BsonRepresentation(BsonType.String)]
    Delivery = 1,
}