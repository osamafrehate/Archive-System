using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.Interfaces.Authentication
{
    public interface IAuthService
    {
        Task<string> LoginAsync(string username, string password, CancellationToken ct);
        Task<string> RegisterAsync(string username, string password, CancellationToken ct);
    }
}
