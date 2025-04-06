import grpc
import package_pb2 as pb2
import package_pb2_grpc as pb2_grpc


class PackageGrpcClient:
    def __init__(self, host):
        self.host = host
        self.channel = grpc.insecure_channel(self.host)
        self.stub = pb2_grpc.PackageProtoStub(self.channel)

    def add_package(
        self,
        destination_street,
        destination_country,
        destination_number,
        destination_region_code,
        origin_address,
        current_location,
        status,
        date,
        destination_location,
        origin_location,
    ):
        """Add a new package (using PackageRequest)"""
        request = pb2.PackageRequest(
            destinationStreet=destination_street,
            destinationCountry=destination_country,
            destinationNumber=destination_number,  # must be string
            destinationRegionCode=destination_region_code,
            originAddress=origin_address,
            currentLocation=pb2.GrpcGeoLocation(
                latitude=current_location["latitude"],
                longitude=current_location["longitude"],
            ),
            status=status,  # e.g., pb2.Status.InTransit
            date=date,
            destinationLocation=pb2.GrpcGeoLocation(
                latitude=destination_location["latitude"],
                longitude=destination_location["longitude"],
            ),
            originLocation=pb2.GrpcGeoLocation(
                latitude=origin_location["latitude"],
                longitude=origin_location["longitude"],
            ),
        )
        return self.stub.AddPackage(request)

    def update_package(self, package_id, status, current_location):
        """Update an existing package (using UpdatePackageRequest)"""
        request = pb2.UpdatePackageRequest(
            id=package_id,
            status=status,
            currentLocation=pb2.GrpcGeoLocation(
                latitude=current_location["latitude"],
                longitude=current_location["longitude"],
            ),
        )
        return self.stub.UpdatePackage(request)

   