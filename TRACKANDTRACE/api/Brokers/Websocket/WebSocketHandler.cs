using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using TrackAndTrace.Repo.Packages;
using TrackAndTrace.Repo.Shipments;

public static class WebSocketHandler
{
    private static readonly ConcurrentDictionary<string, ConcurrentDictionary<string, WebSocket>> _topicSockets = new ConcurrentDictionary<string, ConcurrentDictionary<string, WebSocket>>();
    private static IRepoPackages _packageRepo;

    private static IRepoShipment _shipmentRepo;

    public static void Initialize(IRepoPackages packageRepo, IRepoShipment shipmentRepo)
    {
        _packageRepo = packageRepo;
        _shipmentRepo = shipmentRepo;
    }


    public static void InitializeWebSocket(string topic)
    {
        _topicSockets.GetOrAdd(topic, _ => new ConcurrentDictionary<string, WebSocket>());
        Console.WriteLine($"WebSocket initialized for topic: {topic}");
    }

    public static async Task HandleWebSocketAsync(WebSocket webSocket, string topic)
    {
        Console.WriteLine($"WebSocket connected for topic: {topic}");

        if (topic.StartsWith("package/"))
        {
            var packageId = topic.Substring("package/".Length);
            if (!string.IsNullOrEmpty(packageId))
            {

                var package = await _packageRepo.GetPackage(packageId);
                if (package != null)
                {
                    InitializeWebSocket(topic);
                }
                else
                {
                    Console.WriteLine($"Package with ID {packageId} not found.");
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Package not found", CancellationToken.None);
                    return;
                }
            }
            else if (topic.StartsWith("shipment/"))
            {
                var shipmentId = topic.Substring("shipment/".Length);
                if (!string.IsNullOrEmpty(shipmentId))
                {

                    var shipment = await _shipmentRepo.GetShipment(shipmentId);
                    if (shipment != null)
                    {
                        InitializeWebSocket(topic);
                    }
                    else
                    {
                        Console.WriteLine($"Shipment with ID {shipmentId} not found.");
                        await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Shipment not found", CancellationToken.None);
                        return;
                    }
                }
            }
            else
            {
                Console.WriteLine($"Invalid package ID: {packageId}");
                await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Invalid package ID", CancellationToken.None);
                return;
            }
        }
        else
        {
            InitializeWebSocket(topic);
        }

        var socketId = Guid.NewGuid().ToString();
        var sockets = _topicSockets[topic];
        sockets.TryAdd(socketId, webSocket);

        var buffer = new byte[1024 * 4];
        var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

        while (!result.CloseStatus.HasValue)
        {
            result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
        }

        sockets.TryRemove(socketId, out _);
        await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);

        Console.WriteLine($"WebSocket closed: {socketId} for topic: {topic}");
    }

    public static async Task SendMessageAsync(string topic, string message)
    {
        if (_topicSockets.TryGetValue(topic, out var sockets))
        {
            var buffer = Encoding.UTF8.GetBytes(message);
            var tasks = sockets.Values.Select(socket => socket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None));
            await Task.WhenAll(tasks);

            Console.WriteLine($"Message sent to topic: {topic}, message: {message}");
        }
        else
        {
            Console.WriteLine($"No WebSocket connections available for topic: {topic}");
        }
    }

    public static bool HasConnections(string topic)
    {
        return _topicSockets.TryGetValue(topic, out var sockets) && sockets.Any();
    }
}