public class INotificationService{
    private readonly IWebSocketPublisher _webSocketPublisher;

    public INotificationService(IWebSocketPublisher webSocketPublisher)
    {
        _webSocketPublisher = webSocketPublisher;
    }

    public async Task NotifyDriverAdded(Driver driver)
    {
        await _webSocketPublisher.PublishAsync("driver-added", driver);
    }
}