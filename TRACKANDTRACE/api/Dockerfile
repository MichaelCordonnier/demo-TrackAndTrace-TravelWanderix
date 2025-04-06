# Use the official .NET image as a build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy the project files and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy the remaining files and build the project
COPY . ./
RUN dotnet publish -c Release -o out

# Use the official .NET runtime image as a runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# Run the application
ENTRYPOINT ["sh", "-c", "dotnet api.dll"]