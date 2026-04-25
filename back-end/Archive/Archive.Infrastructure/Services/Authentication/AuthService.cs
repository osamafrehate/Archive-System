using Archive.Application.DTOs;
using Archive.Application.Interfaces.Authentication;
using Archive.Application.Interfaces.Caching;
using Archive.Application.Interfaces.Repositories;
using Archive.Domain.Entities;
using Archive.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Archive.Infrastructure.Services.Authentication
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepo;
        private readonly IPasswordHasher _hasher;
        private readonly IJwtTokenService _jwt;
        private readonly ArchiveDbContext _context;
        private readonly IConfiguration _config;

        public AuthService(
            IUserRepository userRepo,
            IPasswordHasher hasher,
            IJwtTokenService jwt,
            ArchiveDbContext context,
            IConfiguration config)
        {
            _userRepo = userRepo;
            _hasher = hasher;
            _jwt = jwt;
            _context = context;
            _config = config;
        }

        public async Task<AuthResponse> LoginAsync(string username, string password, CancellationToken ct)
        {
            var user = await _userRepo.GetByUsernameAsync(username, ct);

            if (user == null || !user.IsActive)
                throw new Exception("Invalid credentials");

            if (!_hasher.Verify(password, user.PasswordHash))
                throw new Exception("Invalid credentials");

            var accessToken = _jwt.GenerateToken(user.Id, user.Username, user.Role);
            var refreshTokenValue = _jwt.CreateRefreshToken();

            var refreshToken = new RefreshToken
            {
                Token = refreshTokenValue,
                ExpiresAt = DateTime.UtcNow.AddHours(int.Parse(_config["Jwt:RefreshTokenHours"]!)),
                UserId = user.Id
            };

            await _context.RefreshTokens.AddAsync(refreshToken, ct);
            await _context.SaveChangesAsync(ct);

            return new AuthResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshTokenValue
            };
        }

        public async Task<string> RegisterAsync(string username, string password, CancellationToken ct)
        {
            var existing = await _userRepo.GetByUsernameAsync(username, ct);

            if (existing != null)
                throw new Exception("User already exists");

            var hash = _hasher.Hash(password);

            var user = new User(username, hash);

            await _userRepo.AddAsync(user, ct);

            return "User created successfully";
        }

        public async Task<AuthResponse?> RefreshAsync(string refreshToken, CancellationToken ct)
        {
            var storedToken = await _context.RefreshTokens
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken, ct);

            if (storedToken == null || storedToken.IsRevoked || storedToken.ExpiresAt < DateTime.UtcNow)
                return null;

            var newAccessToken = _jwt.GenerateToken(storedToken.User.Id, storedToken.User.Username, storedToken.User.Role);

            return new AuthResponse
            {
                AccessToken = newAccessToken,
                RefreshToken = storedToken.Token
            };
        }

        public async Task LogoutAsync(string refreshToken, CancellationToken ct)
        {
            var token = await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken, ct);

            if (token != null)
            {
                token.IsRevoked = true;
                await _context.SaveChangesAsync(ct);
            }
        }
    }
}

