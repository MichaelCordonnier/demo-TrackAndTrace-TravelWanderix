using System;
using System.Threading.Tasks;

namespace TrackAndTrace.TimeProvider
{
    public interface ITimeService
    {
        DateTime Now { get; }
        DateTime? PreviousTime { get; }
        event EventHandler TimeChanged;
        Task SetTime(DateTime time);
        Task ResetTime();

        Task SetTimeWithNotification(DateTime time);
       
        Task ResetTimeWithNotification();
    }

    public class TimeProviderService : ITimeService
    {
        private DateTime? _simulatedTime;
        private DateTime? _previousTime;
        private readonly IWebSocketPublisher _webSocketPublisher;

        private readonly ITimeUpdatePublisher _timeUpdatePublisher;

        public TimeProviderService(IWebSocketPublisher webSocketPublisher, ITimeUpdatePublisher timeUpdatePublisher)
        {
            _webSocketPublisher = webSocketPublisher;
            _timeUpdatePublisher = timeUpdatePublisher;
        }
       
        public DateTime Now => _simulatedTime ?? DateTime.UtcNow;
        public DateTime? PreviousTime => _previousTime;

        public event EventHandler TimeChanged;

        public async Task SetTime(DateTime time)
        {
            _previousTime = _simulatedTime ?? DateTime.UtcNow;
            _simulatedTime = time;
            await OnTimeChanged();
        }

        public async Task ResetTime()
        {
            _previousTime = _simulatedTime;
            _simulatedTime = null;
            await OnTimeChanged();
        }

        protected virtual async Task OnTimeChanged()
        {
            TimeChanged?.Invoke(this, EventArgs.Empty); 
            await PublishTimeUpdateWs();     
            await _timeUpdatePublisher.PublishTimeUpdate(Now);      
        }

        private async Task PublishTimeUpdateWs()
        {
            TimeChanged?.Invoke(this, EventArgs.Empty); 
            var currentTime = Now;
            await _webSocketPublisher.PublishAsync("time-updates", currentTime);
        }

        public async Task SetTimeWithNotification(DateTime time)
        {
            TimeChanged?.Invoke(this, EventArgs.Empty); 
            _previousTime = _simulatedTime ?? DateTime.UtcNow;
            _simulatedTime = time;
            await PublishTimeUpdateWs();   
        }

        public async Task ResetTimeWithNotification()
        {
            
            _previousTime = _simulatedTime;
            _simulatedTime = null;
            await PublishTimeUpdateWs();   
        }
    }
}
