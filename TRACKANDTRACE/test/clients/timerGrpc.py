import grpc
import timer_pb2 as pb2
import timer_pb2_grpc as pb2_grpc


class TimeServiceGrpcClient:
    def __init__(self, host):
        self.host = host
        self.channel = grpc.insecure_channel(self.host)
        self.stub = pb2_grpc.TimeServiceStub(self.channel)

    def set_time(self, time):
        """Set the server time"""
        request = pb2.SetTimeRequest(time=time)
        return self.stub.SetTime(request)

    def reset_time(self):
        """Reset the server time to the default"""
        request = pb2.ResetTimeRequest()
        return self.stub.ResetTime(request)

    def get_current_time(self):
        """Retrieve the current server time"""
        request = pb2.CurrentTimeRequest()
        return self.stub.GetCurrentTime(request)
