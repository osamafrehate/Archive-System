using Archive.Application.Interfaces.Authentication;
using Archive.Application.Interfaces.Caching;
using Archive.Application.Interfaces.Repositories;
using Archive.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Archive.Infrastructure.Services.Authentication
{
    public class PermissionService : IPermissionService
    {
        private readonly ArchiveDbContext _context;

        public PermissionService(ArchiveDbContext context)
        {
            _context = context;
        }

        public async Task<bool> HasPermissionAsync(int userId, int categoryId, string permissionName)
        {
            return await _context.UserCategoryPermissions
                .Include(x => x.Permission)
                .AnyAsync(x =>
                    x.UserId == userId &&
                    x.CategoryId == categoryId &&
                    x.Permission.Name == permissionName);
        }
        //    //private readonly IRedisService _redis;

        //    //public PermissionService(IRedisService redis)
        //    //{
        //    //    _redis = redis;
        //    //}

        //    //public async Task<bool> HasPermissionAsync(int userId, string key)
        //    //{
        //    //    var result = await _redis.GetHashValueAsync(
        //    //        $"user:{userId}:permissions",
        //    //        key
        //    //    );

        //    //    return result == "1";
        //    //}
        //}
        /// <summary>
        /// /////////////////////////////////////////////////
        /// </summary>
        //public class PermissionService : IPermissionService
        //{
        //    private readonly IUserRepository _userRepo;

        //    public PermissionService(IUserRepository userRepo)
        //    {
        //        _userRepo = userRepo;
        //    }

        //    public async Task<bool> HasPermissionAsync(int userId, int categoryId, string permission)
        //    {
        //        var permissions = await _userRepo.GetUserPermissionsAsync(userId, CancellationToken.None);

        //        return permissions.Any(x =>
        //            x.CategoryId == categoryId &&
        //            x.Permission.Name == permission);
        //    }
    }
}