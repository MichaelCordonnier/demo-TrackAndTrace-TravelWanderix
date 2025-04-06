FROM python:3.9-slim

WORKDIR /app

# Install build dependencies and curl
RUN apt-get update && apt-get install -y \
    build-essential \
    libev-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Define the entrypoint for the container
ENTRYPOINT ["sh", "-c"]

# Command to run Locust
CMD ["locust -f locustV3.py"]