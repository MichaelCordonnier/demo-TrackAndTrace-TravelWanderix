namespace TrackAndTrace.Models;

public class Adress{
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? ZipCode { get; set; } 
    public string? Country { get; set; } 

    public GeoLocation? GeoLocation { get; set; } 
}