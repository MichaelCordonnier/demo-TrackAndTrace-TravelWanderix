import grpc
import driver_pb2 as pb2
import driver_pb2_grpc as pb2_grpc


class DriverGrpcClient:
    def __init__(self, host):
        self.host = host
        self.channel = grpc.insecure_channel(self.host)
        self.stub = pb2_grpc.DriverProtoStub(self.channel)

    def add_driver(self, name, phone_number, email, status):
        """Add a new driver"""
        request = pb2.DriverRequest(
            name=name, phoneNumber=phone_number, email=email, status=status
        )
        return self.stub.AddDriver(request)

    def get_driver(self, driver_id):
        """Retrieve a driver by ID"""
        request = pb2.DriverIdRequest(id=driver_id)
        return self.stub.GetDriver(request)

    def get_drivers(self):
        """Retrieve all drivers"""
        request = pb2.Empty()
        return self.stub.GetDrivers(request)

    def update_driver(self, driver_id, status):
        """Update a driver's status"""
        request = pb2.DriverUpdateRequest(id=driver_id, status=status)
        return self.stub.UpdateDriver(request)
