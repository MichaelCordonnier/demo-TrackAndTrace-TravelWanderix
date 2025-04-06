# shipmentGrpcClient.py
import grpc
import shipment_pb2 as pb2
import shipment_pb2_grpc as pb2_grpc


class ShipmentGrpcClient:
    def __init__(self, host):
        self.host = host
        self.channel = grpc.insecure_channel(self.host)
        self.stub = pb2_grpc.ShipmentProtoStub(self.channel)

    def get_shipment(self, shipment_id):
        """Retrieve a shipment by ID"""
        request = pb2.ShipmentIdRequest(shipmentId=shipment_id)
        return self.stub.GetShipment(request)

    def get_shipments(self):
        """Retrieve all shipments"""
        request = pb2.Empty()
        return self.stub.GetShipments(request)

    def update_shipment(self, shipment_id, new_status, current_location):
        """Update a shipment's status and location"""
        request = pb2.UpdateShipmentRequest(
            shipmentId=shipment_id,
            newStatus=new_status,
            currentLocation=current_location,
        )
        return self.stub.UpdateShipment(request)

    def get_shipments_by_driver_id(self, driver_id):
        """Retrieve shipments by driver ID"""
        request = pb2.GetShipmentsByDriverIdRequest(driverId=driver_id)
        return self.stub.GetShipmentsByDriverId(request)
