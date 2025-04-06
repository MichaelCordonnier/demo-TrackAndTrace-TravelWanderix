using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using TrackAndTrace.Repo.Packages;

public interface IWebSocketPublisher
{
    Task PublishAsync<T>(string topic, T message);
    Task PublishShipmentAsync(string topic, Shipment shipment);
}

public class WebSocketPublisher : IWebSocketPublisher
{
    private readonly string _webSocketUri;
    private readonly IRepoPackages _packageRepo;

    public WebSocketPublisher(string webSocketUri, IRepoPackages packageRepo)
    {
        _webSocketUri = webSocketUri;
        _packageRepo = packageRepo;
    }

    public async Task PublishAsync<T>(string topic, T message)
    {
        if (WebSocketHandler.HasConnections(topic))
        {
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            var jsonMessage = JsonSerializer.Serialize(new { topic, message }, jsonOptions);
            await WebSocketHandler.SendMessageAsync(topic, jsonMessage);
        }
        else
        {
            Console.WriteLine($"No WebSocket connections available for topic: {topic}. Message not sent.");
        }
    }

    public async Task PublishShipmentAsync(string topic, Shipment shipment)
    {
        var packageDetails = new List<Package>();
        foreach (var packageId in shipment.PackagesIds)
        {
            Console.WriteLine($"Fetching package with ID: {packageId}");
            var package = await _packageRepo.GetPackage(packageId);
            if (package != null)
            {
                packageDetails.Add(package);
                Console.WriteLine($"Fetched package with ID: {package.Id}");
            }
            else
            {
                Console.WriteLine($"Package with ID: {packageId} not found");
            }
        }
        shipment.Packages = packageDetails;

        if (WebSocketHandler.HasConnections(topic))
        {
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            var jsonMessage = JsonSerializer.Serialize(new { topic, shipment }, jsonOptions);
            await WebSocketHandler.SendMessageAsync(topic, jsonMessage);
        }
        else
        {
            Console.WriteLine($"No WebSocket connections available for topic: {topic}. Message not sent.");
        }
    }
}