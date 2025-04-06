from locust import User, SequentialTaskSet, task, between, events
from locust import LoadTestShape
from clients.driverGrpcClient import DriverGrpcClient
from clients.packageGrpcClient import PackageGrpcClient
from clients.timerGrpc import TimeServiceGrpcClient
from clients.shipmentGrpc import ShipmentGrpcClient
import driver_pb2 as pb2
import package_pb2 as pb2_package
import random
import json
import os
import time
from datetime import datetime, timedelta


class TrackAndTraceTasks(SequentialTaskSet):
    def on_start(self):
        """Initialize GRPC clients and load data when a user starts."""
        self.host = "localhost:5002"
        self.data_file = "data/drivers.json"
        self.data_shipment_file = "data/shipments.json"

        self.driver_client = DriverGrpcClient(self.host)
        self.package_client = PackageGrpcClient(self.host)
        self.time_client = TimeServiceGrpcClient(self.host)
        self.shipment_client = ShipmentGrpcClient(self.host)
        self.load_driver_data()
        self.load_shipment_data()

    def load_driver_data(self):
        """Load driver data from the JSON file."""
        os.makedirs(os.path.dirname(self.data_file), exist_ok=True)
        if os.path.exists(self.data_file) and os.path.getsize(self.data_file) > 0:
            with open(self.data_file, "r") as file:
                self.driver_data = json.load(file)
        else:
            self.driver_data = {}

    def delete_driver_date(self):
        """Delete driver data from the JSON file."""
        os.remove(self.data_file)

    def save_driver_data(self):
        """Save driver data to the JSON file."""
        os.makedirs(os.path.dirname(self.data_file), exist_ok=True)
        if os.path.exists(self.data_file) and os.path.getsize(self.data_file) > 0:
            with open(self.data_file, "r") as file:
                existing_data = json.load(file)
        else:
            existing_data = {}

        existing_data.update(self.driver_data)

        with open(self.data_file, "w") as file:
            json.dump(existing_data, file)

    def load_shipment_data(self):
        """Load shipment data from the JSON file."""
        os.makedirs(os.path.dirname(self.data_shipment_file), exist_ok=True)
        if (
            os.path.exists(self.data_shipment_file)
            and os.path.getsize(self.data_shipment_file) > 0
        ):
            with open(self.data_shipment_file, "r") as file:
                self.shipment_data = json.load(file)
        else:
            self.shipment_data = {}

    def delete_shipment_data(self):
        """Delete shipment data from the JSON file."""
        os.remove(self.data_shipment_file)

    def save_shipment_data(self):
        """Save shipment data to the JSON file."""
        os.makedirs(os.path.dirname(self.data_file), exist_ok=True)
        if (
            os.path.exists(self.data_shipment_file)
            and os.path.getsize(self.data_shipment_file) > 0
        ):
            with open(self.data_shipment_file, "r") as file:
                existing_data = json.load(file)
        else:
            existing_data = {}

        existing_data.update(self.shipment_data)

        with open(self.data_shipment_file, "w") as file:
            json.dump(existing_data, file)

    def load_random_coordinates(self):
        """Load random coordinates for testing from coordinates.json."""
        with open("data/coordinates.json", "r") as file:
            coordinates = json.load(file)
        return coordinates

    @task
    def add_driver(self):
        """Task 1: Add a driver, then fetch it."""
        driver_name = f"Driver_{random.randint(1, 1000)}"
        phone_number = f"555-{random.randint(1000, 9999)}"
        email = f"{driver_name.lower()}@example.com"
        status = pb2.WorkerStatus.Driving

        start_time = time.time()
        try:
            driver = self.driver_client.add_driver(
                driver_name, phone_number, email, status
            )
            print(f"Added Driver: ID={driver.id}, Name={driver.name}")

            self.driver_data[driver.id] = {"name": driver.name, "status": driver.status}
            self.save_driver_data()

            fetched_driver = self.driver_client.get_driver(driver.id)
            print(
                f"Fetched Driver: Name={fetched_driver.name}, Status={fetched_driver.status}"
            )

            total_time = int((time.time() - start_time) * 1000)
            events.request.fire(
                request_type="gRPC",
                name="add_and_get_driver",
                response_time=total_time,
                response_length=0,
                exception=None,
            )
        except Exception as e:
            total_time = int((time.time() - start_time) * 1000)
            events.request.fire(
                request_type="gRPC",
                name="add_and_get_driver",
                response_time=total_time,
                response_length=0,
                exception=e,
            )

    @task
    def update_driver_status_foreach(self):
        """Task 2: Update the status of every driver in self.driver_data."""
        for driver_id, driver_data in self.driver_data.items():
            new_status = pb2.WorkerStatus.OffDuty
            start_time = time.time()
            try:
                updated_driver = self.driver_client.update_driver(driver_id, new_status)
                # print(
                #     f"Updated Driver: ID={updated_driver.id}, Name={updated_driver.name}, Status={updated_driver.status}"
                # )

                # Update driver_data in memory
                self.driver_data[driver_id]["status"] = updated_driver.status
                self.save_driver_data()

                total_time = int((time.time() - start_time) * 1000)
                events.request.fire(
                    request_type="gRPC",
                    name="update_driver_status",
                    response_time=total_time,
                    response_length=0,
                    exception=None,
                )
            except Exception as e:
                total_time = int((time.time() - start_time) * 1000)
                events.request.fire(
                    request_type="gRPC",
                    name="update_driver_status",
                    response_time=total_time,
                    response_length=0,
                    exception=e,
                )

    @task
    def add_package_n_times(self):
        """
        Task 3: Add 10 packages in a loop.
        This keeps the test sequential but repeats the package creation 10 times.
        """
        for _ in range(10):
            destination_street = f"Street_{random.randint(1, 1000)}"
            destination_country = "BE"
            destination_number = f"{random.randint(1, 1000)}"
            destination_region_code = "1000"
            origin_address = (
                f"Country_{random.randint(1, 1000)}, "
                f"City_{random.randint(1, 1000)}, "
                f"Street_{random.randint(1, 1000)}, "
                f"Person_{random.randint(1, 1000)}"
            )
            date = "parse Internal copy"

            # Load coordinates and pick random current & destination
            coords = self.load_random_coordinates()
            current_location = random.choice(coords)
            destination_location = random.choice(
                [x for x in coords if x != current_location]
            )

            start_time = time.time()
            try:
                package = self.package_client.add_package(
                    destination_street,
                    destination_country,
                    destination_number,
                    destination_region_code,
                    origin_address,
                    current_location,
                    pb2_package.Status.Pending,
                    date,
                    destination_location,
                )
                print(f"Added Package: ID={package.id}")

                total_time = int((time.time() - start_time) * 1000)
                events.request.fire(
                    request_type="gRPC",
                    name="add_package",
                    response_time=total_time,
                    response_length=0,
                    exception=None,
                )
            except Exception as e:
                total_time = int((time.time() - start_time) * 1000)
                events.request.fire(
                    request_type="gRPC",
                    name="add_package",
                    response_time=total_time,
                    response_length=0,
                    exception=e,
                )

    @task
    def get_latest_time(self):
        """
        Task: Fetch the current time from the server using the snake_case attribute.
        """
        start_time = time.time()
        try:
            current_time_response = self.time_client.get_current_time()

            current_time = current_time_response.current_time

            print(f"Current Server Time: {current_time}")

            total_time = int((time.time() - start_time) * 1000)
            events.request.fire(
                request_type="gRPC",
                name="get_latest_time",
                response_time=total_time,
                response_length=0,
                exception=None,
            )
        except Exception as e:
            total_time = int((time.time() - start_time) * 1000)
            events.request.fire(
                request_type="gRPC",
                name="get_latest_time",
                response_time=total_time,
                response_length=0,
                exception=e,
            )

    @task
    def set_time_plus_one_day(self):
        """
        Task: Set the server time to current_time + 86400 (one day).
        """
        start_time = time.time()
        try:
            current_time_response = self.time_client.get_current_time()

            current_time_str = current_time_response.current_time

            current_time_dt = datetime.fromisoformat(
                current_time_str.replace("Z", "+00:00")
            )

            new_time_dt = current_time_dt + timedelta(days=1)
            new_time_str = new_time_dt.isoformat() + "Z"

            new_time_str = new_time_str.replace("+00:00", "")

            self.time_client.set_time(new_time_str)

            print(f"Set Server Time to: {new_time_str}")

            total_time = int((time.time() - start_time) * 1000)
            events.request.fire(
                request_type="gRPC",
                name="set_time_plus_one_day",
                response_time=total_time,
                response_length=0,
                exception=None,
            )
        except Exception as e:
            total_time = int((time.time() - start_time) * 1000)
            events.request.fire(
                request_type="gRPC",
                name="set_time_plus_one_day",
                response_time=total_time,
                response_length=0,
                exception=e,
            )

    time.sleep(10)

    @task
    def update_driver_status(self):
        """Task 6: Update the status of every driver in self.driver_data."""
        for driver_id, driver_data in self.driver_data.items():
            new_status = pb2.WorkerStatus.Resting
            start_time = time.time()
            try:
                updated_driver = self.driver_client.update_driver(driver_id, new_status)
                # print(
                #     f"Updated Driver: ID={updated_driver.id}, Name={updated_driver.name}, Status={updated_driver.status}"
                # )

                # Update driver_data in memory
                self.driver_data[driver_id]["status"] = updated_driver.status
                self.save_driver_data()

                total_time = int((time.time() - start_time) * 1000)
                events.request.fire(
                    request_type="gRPC",
                    name="update_driver_status",
                    response_time=total_time,
                    response_length=0,
                    exception=None,
                )
            except Exception as e:
                total_time = int((time.time() - start_time) * 1000)
                events.request.fire(
                    request_type="gRPC",
                    name="update_driver_status",
                    response_time=total_time,
                    response_length=0,
                    exception=e,
                )

    @task
    def get_shipments_by_driver_id_for_each(self):
        """
        Task 7: Fetch shipments for each driver in self.driver_data.
        """
        for driver_id, driver_data in self.driver_data.items():
            start_time = time.time()

            try:
                shipments_reply = self.shipment_client.get_shipments_by_driver_id(
                    driver_id
                )

                # Debugging print statement

                for shipment in shipments_reply.shipments:
                    print(f"Shipment object: {shipment}")
                    self.shipment_data[shipment.shipmentId] = {
                        "status": shipment.status,
                        "driverId": shipment.driverId,
                    }

                total_time = int((time.time() - start_time) * 1000)
                events.request.fire(
                    request_type="gRPC",
                    name="get_shipments_by_driver_id_for_each",
                    response_time=total_time,
                    response_length=0,
                    exception=None,
                )
            except Exception as e:
                total_time = int((time.time() - start_time) * 1000)
                events.request.fire(
                    request_type="gRPC",
                    name="get_shipments_by_driver_id_for_each",
                    response_time=total_time,
                    response_length=0,
                    exception=e,
                )

    # update each driver status to driving
    @task
    def update_driver_status_to_driving(self):
        for driver_id, driver_data in self.driver_data.items():
            new_status = pb2.WorkerStatus.Driving
            start_time = time.time()
            try:
                updated_driver = self.driver_client.update_driver(driver_id, new_status)
                # print(
                #     f"Updated Driver: ID={updated_driver.id}, Name={updated_driver.name}, Status={updated_driver.status}"
                # )

                # Update driver_data in memory
                self.driver_data[driver_id]["status"] = updated_driver.status
                self.save_driver_data()

                total_time = int((time.time() - start_time) * 1000)
                events.request.fire(
                    request_type="gRPC",
                    name="update_driver_status",
                    response_time=total_time,
                    response_length=0,
                    exception=None,
                )
            except Exception as e:
                total_time = int((time.time() - start_time) * 1000)
                events.request.fire(
                    request_type="gRPC",
                    name="update_driver_status",
                    response_time=total_time,
                    response_length=0,
                    exception=e,
                )

    # now get each shipment by id
    def get_shipment_by_id(self):
        for shipment_id, shipment_data in self.shipment_data.items():
            start_time = time.time()
            try:
                shipment = self.shipment_client.get_shipment(shipment_id)
                print(f"Shipment: ID={shipment.id}, Status={shipment.status}")

                total_time = int((time.time() - start_time) * 1000)
                events.request.fire(
                    request_type="gRPC",
                    name="get_shipment_by_id",
                    response_time=total_time,
                    response_length=0,
                    exception=None,
                )
            except Exception as e:
                total_time = int((time.time() - start_time) * 1000)
                events.request.fire(
                    request_type="gRPC",
                    name="get_shipment_by_id",
                    response_time=total_time,
                    response_length=0,
                    exception=e,
                )

    @task
    def update_shipments_intransit_or_remove(self):
        """
        For each shipment in our JSON:
         1) Fetch the latest shipment details from gRPC
         2) Check how many packages are unsorted or undelivered (status != 3,5)
         3) If none => remove from self.shipment_data
         4) Otherwise, pick the FIRST unsorted/undelivered package
             -> Update shipment status to InTransit (4)
             -> Use that package's currentLocation for the shipment's new currentLocation
             -> Save changes & re-fetch the shipment to verify
        """
        # We'll iterate over a snapshot of current shipment_data items
        for shipment_id in list(self.shipment_data.keys()):
            start_time = time.time()
            try:
                # 1) Fetch the most recent ShipmentReply from the server
                shipment = self.shipment_client.get_shipment(shipment_id)

                # Gather all packages in the shipment (packages + packagesToDropOff if applicable)
                all_packages = list(shipment.packages) + list(
                    shipment.packagesToDropOff
                )
                # 2) Filter out packages that are Sorted(3) or Delivered(5)
                unsorted_undelivered = [
                    pkg
                    for pkg in all_packages
                    if pkg.status not in [3, 5]  # 3=Sorted, 5=Delivered
                ]

                if not unsorted_undelivered:
                    # 3) All packages are sorted or delivered => remove from local data
                    print(
                        f"All packages in shipment {shipment_id} are sorted or delivered; removing from local data."
                    )
                    del self.shipment_data[shipment_id]
                    self.save_shipment_data()

                    total_time = int((time.time() - start_time) * 1000)
                    events.request.fire(
                        request_type="gRPC",
                        name="update_shipments_intransit_or_remove",
                        response_time=total_time,
                        response_length=0,
                        exception=None,
                    )
                    continue

                # 4) Pick the FIRST package that is not sorted/delivered
                next_pkg = unsorted_undelivered[0]
                pkg_location = next_pkg.currentLocation

                # Convert from the gRPC location type (which has .latitude, .longitude)
                # to a dict or named parameters for the update request
                new_loc = {
                    "latitude": pkg_location.latitude,
                    "longitude": pkg_location.longitude,
                }

                # Now we call update_shipment to set status=InTransit (4) + currentLocation
                updated_shipment = self.shipment_client.update_shipment(
                    shipment_id=shipment_id, new_status=4, current_location=new_loc
                )

                # Persist the updated status to local storage
                self.shipment_data[shipment_id]["status"] = updated_shipment.status
                self.save_shipment_data()

                # Re-fetch to confirm
                refetched = self.shipment_client.get_shipment(shipment_id)
                print(
                    f"Shipment {shipment_id} updated to InTransit. "
                    f"Refetched status={refetched.status}."
                )

                total_time = int((time.time() - start_time) * 1000)
                events.request.fire(
                    request_type="gRPC",
                    name="update_shipments_intransit_or_remove",
                    response_time=total_time,
                    response_length=0,
                    exception=None,
                )

            except Exception as e:
                total_time = int((time.time() - start_time) * 1000)
                events.request.fire(
                    request_type="gRPC",
                    name="update_shipments_intransit_or_remove",
                    response_time=total_time,
                    response_length=0,
                    exception=e,
                )

    @task
    def get_shipment_by_id(self):
        """
        Re-check each shipment by ID to verify current status.
        Prints ID and status to show updates from 'update_shipments_intransit_or_remove'.
        """
        for shipment_id in list(self.shipment_data.keys()):
            start_time = time.time()
            try:
                shipment = self.shipment_client.get_shipment(shipment_id)
                print(f"Shipment by ID={shipment.shipmentId}, status={shipment.status}")

                total_time = int((time.time() - start_time) * 1000)
                events.request.fire(
                    request_type="gRPC",
                    name="get_shipment_by_id",
                    response_time=total_time,
                    response_length=0,
                    exception=None,
                )
            except Exception as e:
                total_time = int((time.time() - start_time) * 1000)
                events.request.fire(
                    request_type="gRPC",
                    name="get_shipment_by_id",
                    response_time=total_time,
                    response_length=0,
                    exception=e,
                )


class TrackAndTraceTester(User):
    """
    The main User class referencing the sequential tasks above.
    Locust will instantiate multiple users, each running tasks in the
    defined sequence, repeating indefinitely.
    """

    wait_time = between(1, 3)
    tasks = [TrackAndTraceTasks]


class MyCustomLoadShape(LoadTestShape):
    """
    50 users for 10 minutes -> 100 users for 15 minutes -> 20 users for 5 minutes
    """

    def tick(self):
        run_time = self.get_run_time()

        # user count, spawn rate
        if run_time < 10 * 60:
            return (10, 1)
        elif run_time < 25 * 60:
            return (100, 5)
        elif run_time < 30 * 60:
            return (200, 15)

        return None


# shape = MyCustomLoadShape
