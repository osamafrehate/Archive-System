//using Archive.Application.Interfaces.Repositories;
//using Archive.Domain.Entities;
//using Archive.Infrastructure.Persistence;
//using Microsoft.EntityFrameworkCore;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace Archive.Infrastructure.Repositories
//{
//    public class UserCategoryPermissionRepository :IUserCategoryPermissionRepository
//    {
//        private readonly ArchiveDbContext _context;

//        public UserCategoryPermissionRepository(ArchiveDbContext context)
//        {
//            _context = context;
//        }

//        public async Task<List<UserCategoryPermission>> GetByUserAndCategory(int userId, int categoryId, CancellationToken ct)
//        {
//            return await _context.UserCategoryPermissions
//                .Include(x => x.Permission)
//                .Where(x => x.UserId == userId && x.CategoryId == categoryId)
//                .ToListAsync(ct);
//        }

//        public async Task AddAsync(UserCategoryPermission entity, CancellationToken ct)
//        {
//            await _context.UserCategoryPermissions.AddAsync(entity, ct);
//        }

//        public async Task RemoveRange(List<UserCategoryPermission> entities, CancellationToken ct)
//        {
//            _context.UserCategoryPermissions.RemoveRange(entities);
//            await Task.CompletedTask;
//        }
//    }
//}
////////////////////////////////////////////////
///
using Archive.Application.Interfaces.Repositories;
using Archive.Domain.Entities;
using Archive.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Archive.Infrastructure.Repositories
{
    public class UserCategoryPermissionRepository : IUserCategoryPermissionRepository
    {
        private readonly ArchiveDbContext _context;

        public UserCategoryPermissionRepository(ArchiveDbContext context)
        {
            _context = context;
        }

        public async Task<List<UserCategoryPermission>> GetByUserAndCategory(
            int userId,
            int categoryId,
            CancellationToken ct)
        {
            return await _context.UserCategoryPermissions
                .Include(x => x.Permission)
                .Where(x => x.UserId == userId && x.CategoryId == categoryId)
                .ToListAsync(ct);
        }

        public async Task AddAsync(UserCategoryPermission entity, CancellationToken ct)
        {
            await _context.UserCategoryPermissions.AddAsync(entity, ct);
        }

        public Task RemoveRange(List<UserCategoryPermission> entities, CancellationToken ct)
        {
            _context.UserCategoryPermissions.RemoveRange(entities);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync(CancellationToken ct)
        {
            await _context.SaveChangesAsync(ct);
        }
    }
}
