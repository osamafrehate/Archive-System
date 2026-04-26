using Archive.Application.Interfaces.Repositories;
using Archive.Domain.Entities;
using Archive.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ArchiveDbContext _context;

        public UserRepository(ArchiveDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByUsernameAsync(string username, CancellationToken ct)
        {
            return await _context.Users
                .FirstOrDefaultAsync(x => x.Username == username, ct);
        }

        public async Task<User?> GetByIdAsync(int id, CancellationToken ct)
        {
            return await _context.Users
                .FirstOrDefaultAsync(x => x.Id == id, ct);
        }

        public async Task<List<UserCategoryPermission>> GetUserPermissionsAsync(int userId, CancellationToken ct)
        {
            return await _context.UserCategoryPermissions
            .Include(x => x.Permission)
                .Include(x => x.Category)
                    .Where(x => x.UserId == userId)
                         .ToListAsync(ct);
        }
        public async Task AddAsync(User user, CancellationToken ct)
        {
            await _context.Users.AddAsync(user, ct);
            await _context.SaveChangesAsync(ct);
        }
        public async Task<List<User>> SearchByUsernameAsync(string keyword, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(keyword))
                return await _context.Users.ToListAsync(ct);

            keyword = keyword.ToLower();

            return await _context.Users
            .Where(x => EF.Functions.Like(x.Username, $"%{keyword}%"))
            .ToListAsync(ct);
        }
        public async Task<List<UserCategoryPermission>> GetUserCategoryPermissionsAsync(
            int userId,
            int? categoryId,
            CancellationToken ct)
        {
            var query = _context.UserCategoryPermissions
                .Include(x => x.Category)
                .Include(x => x.Permission)
                .Where(x => x.UserId == userId);

            if (categoryId.HasValue)
            {
                query = query.Where(x => x.CategoryId == categoryId.Value);
            }

            return await query.ToListAsync(ct);
        }
    }
}
