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
//    public class PermissionRepository :IPermissionRepository
//    {
//        private readonly ArchiveDbContext _context;

//        public PermissionRepository(ArchiveDbContext context)
//        {
//            _context = context;
//        }

//        public async Task<Permission?> GetByNameAsync(string name, CancellationToken ct)
//        {
//            return await _context.Permissions
//                .FirstOrDefaultAsync(p => p.Name == name, ct);
//        }
//    }
//}
///////////////////////
///
using Archive.Application.Interfaces.Repositories;
using Archive.Domain.Entities;
using Archive.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Archive.Infrastructure.Repositories
{
    public class PermissionRepository : IPermissionRepository
    {
        private readonly ArchiveDbContext _context;

        public PermissionRepository(ArchiveDbContext context)
        {
            _context = context;
        }

        public async Task<List<Permission>> GetAllAsync(CancellationToken ct)
        {
            return await _context.Permissions.ToListAsync(ct);
        }

        public async Task<Permission?> GetByIdAsync(int id, CancellationToken ct)
        {
            return await _context.Permissions.FindAsync(new object[] { id }, ct);
        }

        public async Task<Permission?> GetByNameAsync(string name, CancellationToken ct)
        {
            return await _context.Permissions
                .FirstOrDefaultAsync(x => x.Name == name, ct);
        }

        public async Task AddAsync(Permission permission, CancellationToken ct)
        {
            await _context.Permissions.AddAsync(permission, ct);
        }

        public void Remove(Permission permission)
        {
            _context.Permissions.Remove(permission);
        }

  
        public async Task RemoveFromUserCategories(int permissionId, CancellationToken ct)
        {
            var relations = await _context.UserCategoryPermissions
                .Where(x => x.PermissionId == permissionId)
                .ToListAsync(ct);

            if (relations.Any())
            {
                _context.UserCategoryPermissions.RemoveRange(relations);
            }
        }

        public async Task SaveChangesAsync(CancellationToken ct)
        {
            await _context.SaveChangesAsync(ct);
        }
    }
}