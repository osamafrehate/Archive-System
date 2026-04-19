using Archive.Application.Interfaces.Authentication;
using Archive.Application.Interfaces.Caching;
using Archive.Application.Interfaces.Repositories;
using Archive.Domain.Entities;

namespace Archive.Infrastructure.Services.Authentication
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepo;
        private readonly IPasswordHasher _hasher;
        private readonly IJwtTokenService _jwt;
        //private readonly IRedisService _redis;

        public AuthService(
            IUserRepository userRepo,
            IPasswordHasher hasher,
            IJwtTokenService jwt
            )
        {
            _userRepo = userRepo;
            _hasher = hasher;
            _jwt = jwt;
            //_redis = redis;
        }

        public async Task<string> LoginAsync(string username, string password, CancellationToken ct)
        {
            var user = await _userRepo.GetByUsernameAsync(username, ct);

            if (user == null || !user.IsActive)
                throw new Exception("Invalid credentials");

            if (!_hasher.Verify(password, user.PasswordHash))
                throw new Exception("Invalid credentials");

            
            var token = _jwt.GenerateToken(user.Id, user.Username);

            
            //var permissions = await _userRepo.GetUserPermissionsAsync(user.Id, ct);

            //var dict = permissions.ToDictionary(
            //    x => $"{x.CategoryId}:{x.Permission.Name}",
            //    x => "1"
            //);

            //await _redis.SetHashAsync($"user:{user.Id}:permissions", dict);

            return token;
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
    }
}