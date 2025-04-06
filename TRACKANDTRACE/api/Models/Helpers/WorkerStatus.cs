public enum WorkerStatus
{


    [BsonRepresentation(BsonType.String)]
    Driving = 0,

    [BsonRepresentation(BsonType.String)]
    Resting = 1,

    [BsonRepresentation(BsonType.String)]
    OffDuty = 2
}
