locust -f locust.py  

python3 -m grpc_tools.protoc -Iprotos --python_out=. --grpc_python_out=. protos/driver.proto

docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}"