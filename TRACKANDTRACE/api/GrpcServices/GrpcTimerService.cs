using Grpc.Core;
using TrackAndTrace.TimeProvider;
using System.Globalization;
using System.Threading.Tasks;

public class TimerService : TimeService.TimeServiceBase
{
    private readonly ITimeService _timeService;

    // Constructor name fixed
    public TimerService(ITimeService timeService)
    {
        _timeService = timeService;
    }

    public override Task<SetTimeResponse> SetTime(SetTimeRequest request, ServerCallContext context)
    {
        if (DateTime.TryParse(request.Time, null, DateTimeStyles.RoundtripKind, out var time))
        {
            _timeService.SetTime(time);
            return Task.FromResult(new SetTimeResponse { Success = true });
        }
        return Task.FromResult(new SetTimeResponse { Success = false });
    }

    public override Task<ResetTimeResponse> ResetTime(ResetTimeRequest request, ServerCallContext context)
    {
        _timeService.ResetTime();
        return Task.FromResult(new ResetTimeResponse { Success = true });
    }

    public override Task<CurrentTimeResponse> GetCurrentTime(CurrentTimeRequest request, ServerCallContext context)
    {
        return Task.FromResult(new CurrentTimeResponse
        {
            CurrentTime = _timeService.Now.ToString("o"),
            PreviousTime = _timeService.PreviousTime?.ToString("o") ?? string.Empty // Null check
        });
    }
}
