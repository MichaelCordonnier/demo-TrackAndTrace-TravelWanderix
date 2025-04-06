from locust import User, SequentialTaskSet, task, between, events, LoadTestShape
from clients.driverGrpcClient import DriverGrpcClient
from clients.packageGrpcClient import PackageGrpcClient
from clients.timerGrpc import TimeServiceGrpcClient
from clients.shipmentGrpc import ShipmentGrpcClient
import driver_pb2 as pb2
import package_pb2 as pb2_package
import random
import json
import time
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()


class TrackAndTraceTasks(SequentialTaskSet):
    wait_time = between(1, 3)
    driver_data = {}
    time_set = False
    drivers_ready = False
    current_user_count = 0
    loop_complete = False

    def on_start(self):
        """Initialize the gRPC clients"""
        self.host = os.getenv("GRPC_HOST", "localhost:5002")
        self.driver_client = DriverGrpcClient(self.host)
        self.package_client = PackageGrpcClient(self.host)
        self.time_client = TimeServiceGrpcClient(self.host)
        self.shipment_client = ShipmentGrpcClient(self.host)

    def on_stop(self):
        """Cleanup resources when the task set stops."""
        try:
            self.driver_client.close()
            self.package_client.close()
            self.time_client.close()
            self.shipment_client.close()
        except Exception as e:
            print(f"Error during cleanup: {e}")

    def soft_reset_drivers(self):
        """Soft reset all drivers for the next loop."""
        for driver_id in TrackAndTraceTasks.driver_data.keys():
            TrackAndTraceTasks.driver_data[driver_id] = {
                "packages_created": 0,
                "status_updated": False,
                "all_shipments_done": False,
            }
        TrackAndTraceTasks.time_set = False
        TrackAndTraceTasks.drivers_ready = False
        TrackAndTraceTasks.drivers_count = 0
        TrackAndTraceTasks.current_user_count = 0
        TrackAndTraceTasks.loop_complete = False
        print("Drivers have been soft reset for the next loop.")

    def create_driver(self):
        """Create a single driver."""
        driver_name = f"Driver_{random.randint(1, 1000)}"
        phone_number = f"555-{random.randint(1000, 9999)}"
        email = f"{driver_name.lower()}@example.com"
        status = pb2.WorkerStatus.OffDuty

        start_time = time.time()
        try:
            driver = self.driver_client.add_driver(
                driver_name, phone_number, email, status
            )

            print(f"Driver created: {driver.id}")
            TrackAndTraceTasks.driver_data[driver.id] = {
                "packages_created": 0,
                "status_updated": False,
                "all_shipments_done": False,
            }

            events.request.fire(
                request_type="Create Driver",
                name="create_driver",
                response_time=(time.time() - start_time) * 1000,
                response_length=0,
            )
        except Exception as e:
            events.request.fire(
                request_type="Create Driver",
                name="create_driver",
                response_time=(time.time() - start_time) * 1000,
                exception=e,
            )

    def create_packages_for_driver(self, driver_id):
        """Create 10 packages for a given driver."""
        while TrackAndTraceTasks.driver_data[driver_id]["packages_created"] < 10:
            destination_street = f"Street_{random.randint(1, 1000)}"
            destination_country = "BE"
            destination_number = f"{random.randint(1, 1000)}"
            destination_region_code = "1000"
            origin_address = (
                f"Country_{random.randint(1, 1000)}, City_{random.randint(1, 1000)}, "
                f"Street_{random.randint(1, 1000)}, Person_{random.randint(1, 1000)}"
            )
            date = "parse Internal copy"

            coords = self.load_random_coordinates()
            current_location = random.choice(coords)
            destination_location = random.choice(
                [x for x in coords if x != current_location]
            )
            origin_location = random.choice(
                [
                    x
                    for x in coords
                    if x != current_location and x != destination_location
                ]
            )

            print(
                f"Creating package for driver {driver_id}. With following:{current_location}, {destination_location}, {origin_location}"
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
                    origin_location,
                )

                print(f"Package created: ID={package.id}")
                TrackAndTraceTasks.driver_data[driver_id]["packages_created"] += 1

                events.request.fire(
                    request_type="Create Package",
                    name="create_package",
                    response_time=(time.time() - start_time) * 1000,
                    response_length=0,
                )
            except Exception as e:
                events.request.fire(
                    request_type="Create Package",
                    name="create_package",
                    response_time=(time.time() - start_time) * 1000,
                    exception=e,
                )

    def check_all_packages_created(self):
        """Check if all drivers have 10 packages."""
        return all(
            data["packages_created"] >= 10
            for data in TrackAndTraceTasks.driver_data.values()
        )

    def set_time_plus_one_day(self):
        """Advance the server time by one day."""
        if TrackAndTraceTasks.time_set:
            print("Time already set.")
            return

        start_time = time.time()

        try:
            # Get the current server time
            current_time_response = self.time_client.get_current_time()
            current_time_str = current_time_response.current_time

            # Convert the string to a datetime object
            current_time_str = current_time_str.replace("Z", "")
            if "." in current_time_str:
                current_time_str = current_time_str[: current_time_str.index(".") + 7]
            current_time_dt = datetime.fromisoformat(current_time_str)

            # Add one day to the current time
            new_time_dt = current_time_dt + timedelta(days=1)
            new_time_str = new_time_dt.isoformat() + "Z"

            # Set the server time
            self.time_client.set_time(new_time_str)
            print(f"Set Server Time to: {new_time_str}")

            # Fire the request event
            events.request.fire(
                request_type="Set Time",
                name="set_time_plus_one_day",
                response_time=(time.time() - start_time) * 1000,
                response_length=0,
            )

            # Mark time as set
            TrackAndTraceTasks.time_set = True

            time.sleep(10)
        except Exception as e:
            print(f"Error in set_time_plus_one_day: {e}")
            raise

    @task
    def driver_task(self):
        """Main task for driver creation and package assignment."""

        if TrackAndTraceTasks.loop_complete:
            print("Loop already complete.")
            # now go to the next task
            # check if time is set
            self.set_time_plus_one_day()
            return

        print("Starting a new loop.")

        TrackAndTraceTasks.drivers_count = len(TrackAndTraceTasks.driver_data)

        current_user_count = self.parent.environment.runner.user_count

        # Add drivers if there are fewer drivers than users
        while TrackAndTraceTasks.drivers_count < current_user_count:
            self.create_driver()
            TrackAndTraceTasks.drivers_count += 1

        # Remove excess drivers if there are more drivers than users
        while TrackAndTraceTasks.drivers_count > current_user_count:
            excess_driver_ids = list(TrackAndTraceTasks.driver_data.keys())[
                : TrackAndTraceTasks.drivers_count - current_user_count
            ]
            for driver_id in excess_driver_ids:
                del TrackAndTraceTasks.driver_data[driver_id]
                TrackAndTraceTasks.drivers_count -= 1
                print(f"Driver {driver_id} removed due to user downscaling.")

        for driver_id in list(TrackAndTraceTasks.driver_data.keys()):
            self.create_packages_for_driver(driver_id)

        if TrackAndTraceTasks.drivers_count == current_user_count:
            TrackAndTraceTasks.drivers_ready = True

        if self.check_all_packages_created() and not TrackAndTraceTasks.time_set:
            self.set_time_plus_one_day()

        TrackAndTraceTasks.loop_complete = True

        time.sleep(5)

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

        print("get_shipments_by_driver_ids")

        all_done = True

        for driver_id in list(TrackAndTraceTasks.driver_data.keys()):
            start_time = time.time()
            try:
                shipments_reply = self.shipment_client.get_shipments_by_driver_id(
                    driver_id
                )

                for shipment in shipments_reply.shipments:

                    if shipment.status == 5:
                        print(
                            f"Shipment {shipment.shipmentId} is fully delivered; skipping."
                        )
                        continue

                    print(f"Shipment ID: {shipment.shipmentId}")
                    print(f"Shipment Status: {shipment.status}")

                    if shipment.status == 0:
                        print(f"Shipment {shipment.shipmentId} is pending; skipping.")
                        continue

                    print(f"Shipment ID: {shipment.shipmentId}")
                    print(f"Shipment: {shipment}")
                    all_packages = list(shipment.packages)
                    # filter out all delivered shipments and all shipments that are pending

                    if any(pkg.status not in [3, 5] for pkg in all_packages):
                        all_done = False

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

        if all_done:
            print("All shipments are done.")
            self.soft_reset_drivers()

    @task
    def update_shipments_intransit_or_remove(self):
        if not TrackAndTraceTasks.time_set:
            return

        for driver_id, driver_data in list(TrackAndTraceTasks.driver_data.items()):
            if driver_data["all_shipments_done"]:
                continue

            try:
                start_time = time.time()
                shipments_reply = self.shipment_client.get_shipments_by_driver_id(
                    driver_id
                )
                total_time = int((time.time() - start_time) * 1000)
                events.request.fire(
                    request_type="gRPC",
                    name="get_shipments_by_driver_id",
                    response_time=total_time,
                    response_length=0,
                    exception=None,
                )

                all_shipments_done = True
                for shipment in shipments_reply.shipments:
                    # filter out all delivered shipments
                    # with status 5
                    if shipment.status == 5:
                        print(
                            f"Shipment {shipment.shipmentId} is fully delivered; skipping."
                        )
                        continue

                    if shipment.status == 0:
                        print(f"Shipment {shipment.shipmentId} is pending; skipping.")
                        continue

                    all_packages = list(shipment.packages)
                    print(f"Shipment ID: {shipment.shipmentId}")
                    print(f"Shipment Contains: {all_packages}")

                    unsorted_undelivered = []
                    for pkg in all_packages:
                        if pkg.status in [1, 3, 4]:
                            unsorted_undelivered.append(pkg)

                    print(f"Unsorted undelivered: {unsorted_undelivered}")

                    if unsorted_undelivered:
                        all_shipments_done = False

                    if not unsorted_undelivered:
                        print(
                            f"All packages in shipment {shipment.shipmentId} are sorted or delivered; marking as done."
                        )
                        continue

                    for next_pkg in unsorted_undelivered:
                        print(f"Next package: {next_pkg}")
                        pkg_location = next_pkg

                        new_loc = None
                        if shipment.type == 1:
                            new_loc = {
                                "latitude": pkg_location.destinationLocation.latitude,
                                "longitude": pkg_location.destinationLocation.longitude,
                            }

                        elif shipment.type == 0:
                            new_loc = {
                                "latitude": pkg_location.originLocation.latitude,
                                "longitude": pkg_location.originLocation.longitude,
                            }

                        if new_loc:
                            start_time = time.time()
                            updated_shipment = self.shipment_client.update_shipment(
                                shipment_id=shipment.shipmentId,
                                new_status=4,
                                current_location=new_loc,
                            )

                            print(
                                f"Shipment {shipment.shipmentId} updated to InTransit."
                            )
                            total_time = int((time.time() - start_time) * 1000)
                            events.request.fire(
                                request_type="gRPC",
                                name="update_shipment",
                                response_time=total_time,
                                response_length=0,
                                exception=None,
                            )

                            time.sleep(1)

                if all_shipments_done:
                    # update status to offduty

                    total_time = time.time()
                    self.driver_client.update_driver(
                        driver_id, pb2.WorkerStatus.OffDuty
                    )
                    total_time = int((time.time() - total_time) * 1000)
                    events.request.fire(
                        request_type="gRPC",
                        name="update_driver_status",
                        response_time=total_time,
                        response_length=0,
                        exception=None,
                    )

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

                time.sleep(1)

            except Exception as e:
                total_time = int((time.time() - start_time) * 1000)
                events.request.fire(
                    request_type="gRPC",
                    name="update_shipments_intransit_or_remove",
                    response_time=total_time,
                    response_length=0,
                    exception=e,
                )

        # Check if all drivers are done
        if all(
            driver_data["all_shipments_done"]
            for driver_data in TrackAndTraceTasks.driver_data.values()
        ):
            print("All drivers are done. Resetting the test.")
            # write this away how many times a test is done
            test_count_file = "data/test_count.txt"
            if not os.path.exists(test_count_file):
                with open(test_count_file, "w") as file:
                    file.write("0")

            # write this away how many times a test is done
            with open(test_count_file, "r") as file:
                content = file.read().strip()
                count = int(content) if content else 0
            with open(test_count_file, "w") as file:
                file.write(str(count + 1))

            self.soft_reset_drivers()
            # for debugging purpose stop
            # self.parent.environment.runner.quit()

    def load_random_coordinates(self):
        """Load random coordinates for testing from coordinates.json."""
        with open("data/coordinates.json", "r") as file:
            return json.load(file)


class TrackAndTraceTester(User):
    wait_time = between(1, 3)
    tasks = [TrackAndTraceTasks]


class CustomLoadShape(LoadTestShape):
    stages = [
        {"duration": 60, "users": 10, "spawn_rate": 10},
        {"duration": 120, "users": 100, "spawn_rate": 15},
        {"duration": 180, "users": 150, "spawn_rate": 5},
    ]

    # stages = [{"duration": 9999, "users": 10, "spawn_rate": 1}]

    def tick(self):
        run_time = self.get_run_time()

        for stage in self.stages:
            if run_time < stage["duration"]:
                return stage["users"], stage["spawn_rate"]

        return None
