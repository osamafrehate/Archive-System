using Archive.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.Interfaces.Authentication
{
    public interface IAuthService
    {
        Task<AuthResponse> LoginAsync(string username, string password, CancellationToken ct);
        Task<string> RegisterAsync(string username, string password, CancellationToken ct);
        Task<AuthResponse?> RefreshAsync(string refreshToken, CancellationToken ct);
        Task LogoutAsync(string refreshToken, CancellationToken ct);
    }
}
