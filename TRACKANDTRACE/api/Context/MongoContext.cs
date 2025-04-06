using Microsoft.Extensions.Options;
using MongoDB.Driver;
using TrackAndTrace.ConnectionSettings;
namespace TrackAndTrace.Context;

public interface IMongoContext{
    IMongoClient Client { get; }    

    IMongoDatabase Database { get; }

    IMongoCollection<T> GetCollection<T>(string name);
}

public class MongoContext : IMongoContext {
    private readonly IMongoClient _client;

    private readonly IMongoDatabase _database;

    private readonly MongoConnection _settings;


    public IMongoClient Client{
        get{
            return _client;
        }
    }

    public IMongoDatabase Database => _database;

    public MongoContext(
        IOptions<MongoConnection> settings
    ){
        _settings = settings.Value;
        _client = new MongoClient(_settings.ConnectionString);
        _database = _client.GetDatabase(_settings.DatabaseName);

    }

    public IMongoCollection<T> GetCollection<T>(string name){
        return _database.GetCollection<T>(name);
    }
}