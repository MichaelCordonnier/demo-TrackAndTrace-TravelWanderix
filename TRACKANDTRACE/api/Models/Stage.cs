namespace TrackAndTrace.Models; 

public class Stage
{
    public DateTime Date { get; set; }
    public Helpers.Status? Status { get; set; }
    public GeoLocation? GeoLocation { get; set; }
}