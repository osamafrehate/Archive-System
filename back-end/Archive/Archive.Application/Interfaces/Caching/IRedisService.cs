using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.Interfaces.Caching
{
    public interface IRedisService
    {
        Task SetHashAsync(string key, Dictionary<string, string> values);
        Task<string?> GetHashValueAsync(string key, string field);
    }
}
