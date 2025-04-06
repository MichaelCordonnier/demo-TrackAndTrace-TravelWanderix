using TrackAndTrace.GrpcServices;
using TrackAndTrace.ConnectionSettings;
using dotenv.net;
using TrackAndTrace.Context;
using TrackAndTrace.Repo.Drivers;
using TrackAndTrace.Service.Dashboard;
using TrackAndTrace.TimeProvider;
using TrackAndTrace.Repo.Packages;
using TrackAndTrace.Repo.Shipments;


var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();

DotEnv.Load(options: new DotEnvOptions(probeForEnv: true));
var env = DotEnv.Read();

try
{
    string mongoConnectionString = Environment.GetEnvironmentVariable("MONGO_CONNECTION_STRING") ?? env["MONGO_CONNECTION_STRING"];
    
    string mongoDatabaseName = Environment.GetEnvironmentVariable("MONGO_DATABASE_NAME") ?? env["MONGO_DATABASE_NAME"];

    if (string.IsNullOrEmpty(mongoConnectionString) || string.IsNullOrEmpty(mongoDatabaseName))
    {
        throw new Exception("MongoDB connection settings are not set in the environment variables.");
    }

    builder.Services.Configure<MongoConnection>(options =>
    {
        options.ConnectionString = mongoConnectionString;
        options.DatabaseName = mongoDatabaseName;
    });
}
catch (Exception e)
{
    Console.WriteLine($"Error: {e.Message}");
    Environment.Exit(1);
}


var hostName = Environment.GetEnvironmentVariable("HOSTNAME_RABBIMQ") ?? env["HOSTNAME_RABBIMQ"];
var port = int.Parse( Environment.GetEnvironmentVariable("PORT_RABBITMQ") ?? env["PORT_RABBITMQ"]);
var userName = Environment.GetEnvironmentVariable("USER_RABBITMQ") ?? env["USER_RABBITMQ"];
var password = Environment.GetEnvironmentVariable("PASSWORD_RABBITMQ") ?? env["PASSWORD_RABBITMQ"];

if (string.IsNullOrEmpty(hostName) || port == 0 || string.IsNullOrEmpty(userName) || string.IsNullOrEmpty(password))
{
    throw new Exception("RabbitMQ connection settings are not set in the environment variables.");
}


var rabbitConnectionProvider = new RabbitMqConnectionProvider(hostName, port, userName, password);

await rabbitConnectionProvider.InitializeAsync();

builder.Services.AddSingleton<IRabbitMqConnectionProvider>(rabbitConnectionProvider);

builder.Services.AddSingleton<ITimeUpdatePublisher, RabbitMqTimeUpdatePublisher>();


builder.Services.AddTransient<IMongoContext, MongoContext>();
builder.Services.AddTransient<IRepoDriver, DriverRepo>();
builder.Services.AddTransient<IRepoPackages, PackageRepo>();
builder.Services.AddTransient<IRepoShipment, ShipmentRepo>();
builder.Services.AddTransient<IDashboardService, DashboardService>();
builder.Services.AddSingleton<DriverUpdateQueue>();
builder.Services.AddSingleton<PackageQueue>();
builder.Services.AddSingleton<PackageUpdateQueue>();
builder.Services.AddHostedService<PackageUpdateWorker>();
builder.Services.AddHostedService<PackageWorker>();
builder.Services.AddHostedService<DriverUpdateWorker>();
builder.Services.AddSingleton<ShipmentUpdateQueue>();
builder.Services.AddHostedService<ShipmentUpdateWorker>();
builder.Services.AddSingleton<ITimeService, TimeProviderService>();
builder.Services.AddHostedService<TimeUpdateWorker>();


// builder.Services.AddCors(options =>
// {
//     options.AddPolicy("AllowSpecificOrigin",
//         builder => builder.WithOrigins(
//             Environment.GetEnvironmentVariable("FRONTEND_URL") ?? env["FRONTEND_URL"]
//         )
//                           .AllowAnyHeader()
//                           .AllowAnyMethod());
// });
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder => builder
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

// Register the WebSocket URI
string webSocketUri = Environment.GetEnvironmentVariable("WS_URI") ?? string.Empty;
builder.Services.AddSingleton<IWebSocketPublisher>(sp => new WebSocketPublisher(webSocketUri, sp.GetRequiredService<IRepoPackages>()));
// MongoDB 

// Configure Kestrel to use the settings from appsettings.json
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(int.Parse(
        Environment.GetEnvironmentVariable("PORT_HTTP") ?? env["PORT_HTTP"]
    )); // HTTP
    // options.ListenAnyIP(int.Parse(
    //     Environment.GetEnvironmentVariable("PORT_HTTPS") ?? "5001"
    // ), listenOptions => listenOptions.UseHttps()); // HTTPS
    options.ListenAnyIP(int.Parse(
        Environment.GetEnvironmentVariable("PORT_GRPC") ?? env["PORT_GRPC"]
    ), listenOptions => listenOptions.Protocols = Microsoft.AspNetCore.Server.Kestrel.Core.HttpProtocols.Http2); // gRPC
});

builder.Services.AddGrpc();
builder.Services.AddGrpcReflection();
builder.Services.AddLogging(); // Add logging services

var app = builder.Build();

app.UseCors("AllowSpecificOrigin");

app.UseWebSockets();

app.MapGrpcService<DriverService>();
app.MapGrpcService<PackageService>();
app.MapGrpcService<TimerService>();
app.MapGrpcService<ShipmentService>();

if (app.Environment.IsDevelopment())
{
    app.MapGrpcReflectionService();
}

app.MapGet("/api/health", () =>
{
    return Results.Ok(new { status = "Healthy" });
});

app.MapGet("/api/drivers", async (IDashboardService dashboardService) =>
{
    return await dashboardService.GetDrivers();
});

app.MapGet("/api/packages", async (IDashboardService dashboardService) =>
{
    return await dashboardService.GetPackages();
});

app.MapGet("/api/shipments", async (IDashboardService dashboardService) =>
{
    return await dashboardService.GetShipments();
});

// get shipment by id 
app.MapGet("/api/shipment/{id}", async (IDashboardService dashboardService, string id) =>
{
    return await dashboardService.GetShipmentById(id);
});

// get package by id
app.MapGet("/api/package/{id}", async (IDashboardService dashboardService, string id) =>
{
    return await dashboardService.GetPackageById(id);
});



app.MapGet("/api/time", async (IDashboardService dashboardService) =>
{
    return await dashboardService.GetCurrentTimeAsync();
});

app.Map("/ws/{topic}", async context =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        Console.WriteLine("WebSocket request received.");
        var topic = context.Request.Path.Value.Substring("/ws/".Length);
        Console.WriteLine($"Topic: {topic}");
        var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        Console.WriteLine("WebSocket accepted.");
        await WebSocketHandler.HandleWebSocketAsync(webSocket, topic);
    }
    else
    {
        context.Response.StatusCode = 400;
    }
});

app.Map("/ws/package/{id}", async context =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        Console.WriteLine("WebSocket request received. With ID");
        var packageId = context.Request.Path.Value.Substring("/ws/package/".Length);
        Console.WriteLine($"Package ID: {packageId}");
        var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        Console.WriteLine("WebSocket accepted.");
        await WebSocketHandler.HandleWebSocketAsync(webSocket, $"package/{packageId}");
    }
    else
    {
        context.Response.StatusCode = 400;
    }
});

app.Map("/ws/shipment/{id}", async context =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        Console.WriteLine("WebSocket request received. With ID");
        var shipmentId = context.Request.Path.Value.Substring("/ws/shipment/".Length);
        Console.WriteLine($"Shipment ID: {shipmentId}");
        var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        Console.WriteLine("WebSocket accepted.");
        await WebSocketHandler.HandleWebSocketAsync(webSocket, $"shipment/{shipmentId}");
    }
    else
    {
        context.Response.StatusCode = 400;
    }
});

WebSocketHandler.Initialize(app.Services.GetRequiredService<IRepoPackages>(), app.Services.GetRequiredService<IRepoShipment>());
WebSocketHandler.InitializeWebSocket("driver-updates");
WebSocketHandler.InitializeWebSocket("package-updates");
WebSocketHandler.InitializeWebSocket("shipment-updates");
WebSocketHandler.InitializeWebSocket("time-updates");

var packageQueue = app.Services.GetRequiredService<PackageQueue>();
// if the queue is empty, restore the packages from the database can if the api crashes. 
await packageQueue.Init();


Console.WriteLine($"gRPC service listening on: http://localhost:5002");

app.Run();