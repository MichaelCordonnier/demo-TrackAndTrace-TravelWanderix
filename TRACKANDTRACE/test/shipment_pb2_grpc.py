# Generated by the gRPC Python protocol compiler plugin. DO NOT EDIT!
"""Client and server classes corresponding to protobuf-defined services."""
import grpc
import warnings

import driver_pb2 as driver__pb2
import shipment_pb2 as shipment__pb2

GRPC_GENERATED_VERSION = '1.69.0'
GRPC_VERSION = grpc.__version__
_version_not_supported = False

try:
    from grpc._utilities import first_version_is_lower
    _version_not_supported = first_version_is_lower(GRPC_VERSION, GRPC_GENERATED_VERSION)
except ImportError:
    _version_not_supported = True

if _version_not_supported:
    raise RuntimeError(
        f'The grpc package installed is at version {GRPC_VERSION},'
        + f' but the generated code in shipment_pb2_grpc.py depends on'
        + f' grpcio>={GRPC_GENERATED_VERSION}.'
        + f' Please upgrade your grpc module to grpcio>={GRPC_GENERATED_VERSION}'
        + f' or downgrade your generated code using grpcio-tools<={GRPC_VERSION}.'
    )


class ShipmentProtoStub(object):
    """Missing associated documentation comment in .proto file."""

    def __init__(self, channel):
        """Constructor.

        Args:
            channel: A grpc.Channel.
        """
        self.GetShipment = channel.unary_unary(
                '/ShipmentProto/GetShipment',
                request_serializer=shipment__pb2.ShipmentIdRequest.SerializeToString,
                response_deserializer=shipment__pb2.ShipmentReply.FromString,
                _registered_method=True)
        self.GetShipments = channel.unary_unary(
                '/ShipmentProto/GetShipments',
                request_serializer=driver__pb2.Empty.SerializeToString,
                response_deserializer=shipment__pb2.ShipmentListReply.FromString,
                _registered_method=True)
        self.UpdateShipment = channel.unary_unary(
                '/ShipmentProto/UpdateShipment',
                request_serializer=shipment__pb2.UpdateShipmentRequest.SerializeToString,
                response_deserializer=shipment__pb2.ShipmentReply.FromString,
                _registered_method=True)
        self.GetShipmentsByDriverId = channel.unary_unary(
                '/ShipmentProto/GetShipmentsByDriverId',
                request_serializer=shipment__pb2.GetShipmentsByDriverIdRequest.SerializeToString,
                response_deserializer=shipment__pb2.ShipmentListReply.FromString,
                _registered_method=True)


class ShipmentProtoServicer(object):
    """Missing associated documentation comment in .proto file."""

    def GetShipment(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')

    def GetShipments(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')

    def UpdateShipment(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')

    def GetShipmentsByDriverId(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')


def add_ShipmentProtoServicer_to_server(servicer, server):
    rpc_method_handlers = {
            'GetShipment': grpc.unary_unary_rpc_method_handler(
                    servicer.GetShipment,
                    request_deserializer=shipment__pb2.ShipmentIdRequest.FromString,
                    response_serializer=shipment__pb2.ShipmentReply.SerializeToString,
            ),
            'GetShipments': grpc.unary_unary_rpc_method_handler(
                    servicer.GetShipments,
                    request_deserializer=driver__pb2.Empty.FromString,
                    response_serializer=shipment__pb2.ShipmentListReply.SerializeToString,
            ),
            'UpdateShipment': grpc.unary_unary_rpc_method_handler(
                    servicer.UpdateShipment,
                    request_deserializer=shipment__pb2.UpdateShipmentRequest.FromString,
                    response_serializer=shipment__pb2.ShipmentReply.SerializeToString,
            ),
            'GetShipmentsByDriverId': grpc.unary_unary_rpc_method_handler(
                    servicer.GetShipmentsByDriverId,
                    request_deserializer=shipment__pb2.GetShipmentsByDriverIdRequest.FromString,
                    response_serializer=shipment__pb2.ShipmentListReply.SerializeToString,
            ),
    }
    generic_handler = grpc.method_handlers_generic_handler(
            'ShipmentProto', rpc_method_handlers)
    server.add_generic_rpc_handlers((generic_handler,))
    server.add_registered_method_handlers('ShipmentProto', rpc_method_handlers)


 # This class is part of an EXPERIMENTAL API.
class ShipmentProto(object):
    """Missing associated documentation comment in .proto file."""

    @staticmethod
    def GetShipment(request,
            target,
            options=(),
            channel_credentials=None,
            call_credentials=None,
            insecure=False,
            compression=None,
            wait_for_ready=None,
            timeout=None,
            metadata=None):
        return grpc.experimental.unary_unary(
            request,
            target,
            '/ShipmentProto/GetShipment',
            shipment__pb2.ShipmentIdRequest.SerializeToString,
            shipment__pb2.ShipmentReply.FromString,
            options,
            channel_credentials,
            insecure,
            call_credentials,
            compression,
            wait_for_ready,
            timeout,
            metadata,
            _registered_method=True)

    @staticmethod
    def GetShipments(request,
            target,
            options=(),
            channel_credentials=None,
            call_credentials=None,
            insecure=False,
            compression=None,
            wait_for_ready=None,
            timeout=None,
            metadata=None):
        return grpc.experimental.unary_unary(
            request,
            target,
            '/ShipmentProto/GetShipments',
            driver__pb2.Empty.SerializeToString,
            shipment__pb2.ShipmentListReply.FromString,
            options,
            channel_credentials,
            insecure,
            call_credentials,
            compression,
            wait_for_ready,
            timeout,
            metadata,
            _registered_method=True)

    @staticmethod
    def UpdateShipment(request,
            target,
            options=(),
            channel_credentials=None,
            call_credentials=None,
            insecure=False,
            compression=None,
            wait_for_ready=None,
            timeout=None,
            metadata=None):
        return grpc.experimental.unary_unary(
            request,
            target,
            '/ShipmentProto/UpdateShipment',
            shipment__pb2.UpdateShipmentRequest.SerializeToString,
            shipment__pb2.ShipmentReply.FromString,
            options,
            channel_credentials,
            insecure,
            call_credentials,
            compression,
            wait_for_ready,
            timeout,
            metadata,
            _registered_method=True)

    @staticmethod
    def GetShipmentsByDriverId(request,
            target,
            options=(),
            channel_credentials=None,
            call_credentials=None,
            insecure=False,
            compression=None,
            wait_for_ready=None,
            timeout=None,
            metadata=None):
        return grpc.experimental.unary_unary(
            request,
            target,
            '/ShipmentProto/GetShipmentsByDriverId',
            shipment__pb2.GetShipmentsByDriverIdRequest.SerializeToString,
            shipment__pb2.ShipmentListReply.FromString,
            options,
            channel_credentials,
            insecure,
            call_credentials,
            compression,
            wait_for_ready,
            timeout,
            metadata,
            _registered_method=True)
