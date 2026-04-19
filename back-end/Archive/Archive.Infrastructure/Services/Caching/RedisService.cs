using Archive.Application.Interfaces.Caching;
using StackExchange.Redis;

namespace Archive.Infrastructure.Services.Caching
{
    public class RedisService : IRedisService
    {
        private readonly IDatabase _db;

        public RedisService(IConnectionMultiplexer redis)
        {
            _db = redis.GetDatabase();
        }

        public async Task SetHashAsync(string key, Dictionary<string, string> values)
        {
            var entries = values.Select(x => new HashEntry(x.Key, x.Value)).ToArray();
            await _db.HashSetAsync(key, entries);
        }

        public async Task<string?> GetHashValueAsync(string key, string field)
        {
            return await _db.HashGetAsync(key, field);
        }
    }
}