from locust import (
    User,
    SequentialTaskSet,
    task,
    between,
    events,
    runners as locust_runner,
)
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
from threading import Lock


class TrackAndTraceTasks(SequentialTaskSet):
    time_set = False
    drivers_created = 0
    drivers_with_packages = 0
    lock = Lock()
    driver_data = {}
    # drivers_data = {}
    drivers_data_db = {}
    shipment_data = {}
    loop_ended = False
    loop_started = False

    def on_start(self):
        # Initialize the gRPC clients
        self.host = "localhost:5002"

        self.driver_client = DriverGrpcClient(self.host)
        self.package_client = PackageGrpcClient(self.host)
        self.time_client = TimeServiceGrpcClient(self.host)
        self.shipment_client = ShipmentGrpcClient(self.host)

    def reset_drivers(self):
        """Reset the driver data."""
        with TrackAndTraceTasks.lock:
            TrackAndTraceTasks.driver_data.clear()
            self.drivers_created = 0
            self.drivers_with_packages = 0
            TrackAndTraceTasks.time_set = False

    def soft_reset_drivers(self):
        """Reset the driver data to the basics."""
        with TrackAndTraceTasks.lock:
            for driver_id in TrackAndTraceTasks.driver_data:
                TrackAndTraceTasks.driver_data[driver_id]["packages_added"] = False
                TrackAndTraceTasks.driver_data[driver_id]["selected"] = False

    def get_drivers(self, required_drivers):
        """Ensure there are enough driver IDs in the data."""
        existing_drivers = len(TrackAndTraceTasks.driver_data)
        if existing_drivers < required_drivers:
            for _ in range(required_drivers - existing_drivers):
                self.create_driver()

    def create_driver(self):
        driver_name = f"Driver_{random.randint(1, 1000)}"
        phone_number = f"555-{random.randint(1000, 9999)}"
        email = f"{driver_name.lower()}@example.com"
        status = pb2.WorkerStatus.OffDuty

        start_time = time.time()
        try:
            driver = self.driver_client.add_driver(
                driver_name, phone_number, email, status
            )

            print(f"Driver created: {driver}")
            self.driver_id = driver.id

            total_time = time.time() - start_time
            events.request.fire(
                request_type="Create Driver",
                name="create_driver",
                response_time=total_time * 1000,
                response_length=0,
            )

            # self.create_driver_if_needed_()
            print("Attempting to acquire lock")

            with TrackAndTraceTasks.lock:
                print("Lock acquired")
                driver_info = {
                    "shipment_1": "",
                    "shipment_1_status": False,
                    "shipment_2": "",
                    "shipment_2_status": False,
                    "packages_added": False,
                    "selected": True,
                    "shipments_checked": False,
                    "all_shipments_done": False,
                    "status_updated": False,
                    "soft_deleted": False,
                }
                TrackAndTraceTasks.driver_data[driver.id] = driver_info
                TrackAndTraceTasks.drivers_data_db[driver.id] = driver_info
                TrackAndTraceTasks.drivers_created += 1

        except Exception as e:
            total_time = time.time() - start_time
            events.request.fire(
                request_type="Create Driver",
                name="create_driver",
                response_time=total_time * 1000,
                exception=e,
            )

    @task
    def create_driver_if_needed_(self):
        required_drivers = self.parent.environment.runner.user_count
        existing_drivers = len(TrackAndTraceTasks.driver_data)

        print(f"Count of Users required: {required_drivers}")
        print(f"Existing drivers: {existing_drivers}")

        if TrackAndTraceTasks.loop_ended:
            print("Attempting to acquire lock for soft_reset_drivers")
            with TrackAndTraceTasks.lock:
                print("Lock acquired for soft_reset_drivers")
                self.soft_reset_drivers()
                TrackAndTraceTasks.loop_ended = False
            print("Lock released for soft_reset_drivers")

        if existing_drivers < required_drivers:
            print("Creating driver")

            # calculate how many drivers to create
            drivers_to_create = required_drivers - existing_drivers

            for _ in range(drivers_to_create):
                self.create_driver()

        if existing_drivers > required_drivers:
            print("Removing excess drivers")
            excess_drivers = existing_drivers - required_drivers
            print("Attempting to acquire lock for removing excess drivers")
            with TrackAndTraceTasks.lock:
                print("Lock acquired for removing excess drivers")
                for driver_id in list(TrackAndTraceTasks.driver_data.keys()):
                    if excess_drivers <= 0:
                        break
                    del TrackAndTraceTasks.driver_data[driver_id]
                    excess_drivers -= 1
            print("Lock released for removing excess drivers")

        # if existing driver is === and loop not started yet
        if existing_drivers == required_drivers and not TrackAndTraceTasks.loop_started:
            TrackAndTraceTasks.loop_started = True
            self.create_packages_for_all_drivers()

    def create_packages_for_all_drivers(self):
        """
        Create 10 packages for each driver.
        """
        for driver_id in TrackAndTraceTasks.driver_data.keys():
            self.create_packages_for_driver(driver_id)

    def create_packages_for_driver(self, driver_id):
        """
        Create 10 packages for the specific driver.
        """
        # Check if packages have already been added for this driver
        if TrackAndTraceTasks.driver_data[driver_id]["packages_added"]:
            print(f"Packages already added for driver {driver_id}")
            return

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
                    name="create_package",
                    response_time=total_time,
                    response_length=0,
                    exception=None,
                )
            except Exception as e:
                total_time = int((time.time() - start_time) * 1000)
                events.request.fire(
                    request_type="gRPC",
                    name="create_package",
                    response_time=total_time,
                    response_length=0,
                    exception=e,
                )
        print(f"Attempting to acquire lock for driver {driver_id}")
        with TrackAndTraceTasks.lock:
            print(f"Lock acquired for driver {driver_id}")
            TrackAndTraceTasks.driver_data[driver_id]["packages_added"] = True
            TrackAndTraceTasks.drivers_with_packages += 1

    @task
    def final_task(self):
        """
        Final task to ensure all drivers have their packages before setting the time forward.
        """
        with TrackAndTraceTasks.lock:
            required_drivers_with_packages = self.parent.environment.runner.user_count
            if (
                not TrackAndTraceTasks.time_set
                and TrackAndTraceTasks.drivers_with_packages
                >= required_drivers_with_packages
            ):
                self.set_time_plus_one_day()

    def set_time_plus_one_day(self):
        """
        Set the server time to current_time + 86400 (one day).
        """
        if TrackAndTraceTasks.time_set:
            return

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

            TrackAndTraceTasks.time_set = True

        except Exception as e:
            total_time = int((time.time() - start_time) * 1000)
            events.request.fire(
                request_type="gRPC",
                name="set_time_plus_one_day",
                response_time=total_time,
                response_length=0,
                exception=e,
            )

        # Call update_driver_status_to_driving and get_shipments_by_driver_id outside the lock

        print("update_driver_status_to_driving completed")
        # self.get_shipments_by_driver_id()

    def load_random_coordinates(self):
        """Load random coordinates for testing from coordinates.json."""
        with open("data/coordinates.json", "r") as file:
            coordinates = json.load(file)
        return coordinates

    @task
    def update_driver_status_to_driving(self):
        if not TrackAndTraceTasks.time_set:
            return
        for driver_id, driver_data in TrackAndTraceTasks.driver_data.items():
            if driver_data["status_updated"]:
                continue
            new_status = pb2.WorkerStatus.Driving
            start_time = time.time()
            try:
                self.driver_client.update_driver(driver_id, new_status)

                total_time = int((time.time() - start_time) * 1000)
                events.request.fire(
                    request_type="gRPC",
                    name="update_driver_status",
                    response_time=total_time,
                    response_length=0,
                    exception=None,
                )

                with TrackAndTraceTasks.lock:
                    TrackAndTraceTasks.driver_data[driver_id]["status_updated"] = True

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
    def get_shipments_by_driver_id(self):
        if not TrackAndTraceTasks.time_set:
            return
        """
        Get the shipments for the driver.
        """

        print("get_shipments_by_driver_ids")

        for driver_id, driver_data in TrackAndTraceTasks.driver_data.items():
            if driver_data["shipments_checked"]:
                continue

            start_time = time.time()
            try:
                shipments_reply = self.shipment_client.get_shipments_by_driver_id(
                    driver_id
                )

                for shipment in shipments_reply.shipments:
                    print(f"Shipment ID: {shipment.shipmentId}")
                    print(f"Shipment: {shipment}")
                    if not TrackAndTraceTasks.driver_data[driver_id]["shipment_1"]:
                        TrackAndTraceTasks.driver_data[driver_id][
                            "shipment_1"
                        ] = shipment.shipmentId
                        TrackAndTraceTasks.driver_data[driver_id][
                            "shipment_1_status"
                        ] = False
                    elif not TrackAndTraceTasks.driver_data[driver_id]["shipment_2"]:
                        TrackAndTraceTasks.driver_data[driver_id][
                            "shipment_2"
                        ] = shipment.shipmentId
                        TrackAndTraceTasks.driver_data[driver_id][
                            "shipment_2_status"
                        ] = False

                TrackAndTraceTasks.driver_data[driver_id]["shipments_checked"] = True

                print("get_shipments_by_driver_id done")

                total_time = int((time.time() - start_time) * 1000)
                events.request.fire(
                    request_type="gRPC",
                    name="get_shipments_by_driver_id",
                    response_time=total_time,
                    response_length=0,
                    exception=None,
                )

            except Exception as e:
                total_time = int((time.time() - start_time) * 1000)
                events.request.fire(
                    request_type="gRPC",
                    name="get_shipments_by_driver_id",
                    response_time=total_time,
                    response_length=0,
                    exception=e,
                )

    @task
    def update_shipments_intransit_or_remove(self):
        if not TrackAndTraceTasks.time_set:
            return
        """
        For each shipment in our JSON:
        1) Fetch the latest shipment details from gRPC
        2) Check how many packages are unsorted or undelivered (status != 3,5)
        3) If none => mark the shipment as done in driver_data
        4) Otherwise, pick the FIRST unsorted/undelivered package
            -> Update shipment status to InTransit (4)
            -> Use that package's currentLocation for the shipment's new currentLocation
            -> Save changes & re-fetch the shipment to verify
        """

        print("update_shipments_intransit_or_remove")
        for driver_id, driver_data in TrackAndTraceTasks.driver_data.items():
            if driver_data["all_shipments_done"]:
                continue

            print(f"Checking shipments for driver {driver_id}")
            print(f"Shipment 1: {driver_data['shipment_1']}")
            print(f"Shipment 2: {driver_data['shipment_2']}")

            for shipment_key in ["shipment_1", "shipment_2"]:
                shipment_id = driver_data.get(shipment_key)
                if not shipment_id:
                    # put the status of that shipment as True
                    TrackAndTraceTasks.driver_data[driver_id][
                        f"{shipment_key}_status"
                    ] = True
                    continue

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
                        # 3) All packages are sorted or delivered => mark shipment as done
                        print(
                            f"All packages in shipment {shipment_id} are sorted or delivered; marking as done."
                        )
                        TrackAndTraceTasks.driver_data[driver_id][
                            f"{shipment_key}_status"
                        ] = True

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
                    TrackAndTraceTasks.driver_data[driver_id][
                        f"{shipment_key}_status"
                    ] = False
                    # Re-fetch to confirm
                    refetched = self.shipment_client.get_shipment(shipment_id)
                    print(
                        f"Shipment {shipment_id} updated to InTransit. "
                        f"Refetched status={refetched.status}."
                    )

                    # if both shipments are done, mark the driver as done
                    if (
                        TrackAndTraceTasks.driver_data[driver_id][f"shipment_1_status"]
                        and TrackAndTraceTasks.driver_data[driver_id][
                            f"shipment_2_status"
                        ]
                    ):
                        TrackAndTraceTasks.driver_data[driver_id][
                            "all_shipments_done"
                        ] = True

                    print("update_shipments_intransit_or_remove done")

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

    # @task
    # def check_all_shipments_done(self):

    #     if not TrackAndTraceTasks.time_set:
    #         return
    #     """
    #     Check if all shipments are done and stop the test if they are.
    #     """

    #     print("check_if_all_shipments_are_done_for_each_driver")

    #     # first check if all drivers have their shipments checked
    #     for driver_id, driver_data in TrackAndTraceTasks.driver_data.items():
    #         if not driver_data["shipments_checked"]:
    #             return

    # all_done = True
    # for driver_id, driver_data in TrackAndTraceTasks.driver_data.items():
    #     if not driver_data["shipments_checked"]:
    #         all_done = False
    #         break
    #     for shipment_key in ["shipment_1", "shipment_2"]:
    #         shipment_id = driver_data.get(shipment_key)
    #         if not shipment_id:
    #             # Mark the status of that shipment as True
    #             TrackAndTraceTasks.driver_data[driver_id][
    #                 f"{shipment_key}_status"
    #             ] = True
    #             continue

    #         if not TrackAndTraceTasks.driver_data[driver_id][
    #             f"{shipment_key}_status"
    #         ]:
    #             all_done = False
    #             break

    #     if not all_done:
    #         break

    # if all_done:
    #     print("All shipments are done. Stopping the test.")
    #     self.parent.environment.runner.quit()


class TrackAndTraceTester(User):
    wait_time = between(1, 3)
    tasks = [TrackAndTraceTasks]


class CustomLoadShape(LoadTestShape):
    """
    Custom load shape that starts with 100 users for testing.
    """

    def tick(self):
        run_time = self.get_run_time()

        # custom load shape 500 users spawnrate 10
        if run_time < 10 * 60:
            # First 10 minutes: 100 users
            return (10, 10)
        else:
            return None

        # if run_time < 10 * 60:
        #     # First 10 minutes: 100 users
        #     return (500, 10)
        # else:
        #     return None


# zaz
