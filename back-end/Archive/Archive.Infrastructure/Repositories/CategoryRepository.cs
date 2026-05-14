using Archive.Application.Interfaces.Repositories;
using Archive.Domain.Entities;
using Archive.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Archive.Infrastructure.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly ArchiveDbContext _context;

        public CategoryRepository(ArchiveDbContext context)
        {
            _context = context;
        }

        public async Task<List<Category>> GetAllAsync(CancellationToken ct)
        {
            return await _context.Categories.AsNoTracking().ToListAsync(ct);
        }

        public async Task<List<Category>> GetActiveAsync(CancellationToken ct)
        {
           return await _context.Categories
               .Where(x => x.IsActive)
               .OrderBy(x => x.Name)
               .ToListAsync(ct);
        }

        public async Task<Category?> GetByIdAsync(int id, CancellationToken ct)
        {
            return await _context.Categories
                .FirstOrDefaultAsync(x => x.Id == id, ct);
        }

        public async Task AddAsync(Category category, CancellationToken ct)
        {
            await _context.Categories.AddAsync(category, ct);
        }

        public async Task SaveChangesAsync(CancellationToken ct)
        {
            await _context.SaveChangesAsync(ct);
        }

        public async Task<bool> ExistsByNameAsync(string name, CancellationToken ct)
        {
            return await _context.Categories
                .AnyAsync(x => x.Name.ToLower() == name.ToLower(), ct);
        }
        public async Task<List<Category>> GetUserCategoriesAsync(int userId, CancellationToken ct)
        {
            return await _context.Categories
           .Where(c =>
            c.IsActive &&
            c.UserCategoryPermissions.Any(p =>
                p.UserId == userId &&
                p.PermissionId == 2 // WRITE
            )
           )
           .AsNoTracking()
           .ToListAsync(ct);
        }
        public async Task<List<Category>> GetUserCategoriesReadPermissionAsync(int userId, CancellationToken ct)
        {
            return await _context.Categories
           .Where(c =>
            c.IsActive &&
            c.UserCategoryPermissions.Any(p =>
                p.UserId == userId &&
                p.PermissionId == 1 // READ
            )
           )
           .AsNoTracking()
           .ToListAsync(ct);
        }
        public async Task<List<Category>> GetUserCategoriesEditPermissionAsync(int userId, CancellationToken ct)
        {
            return await _context.Categories
           .Where(c =>
            c.IsActive &&
            c.UserCategoryPermissions.Any(p =>
                p.UserId == userId &&
                p.PermissionId == 3 // EDIT CATEGORY
            )
           )
           .AsNoTracking()
           .ToListAsync(ct);
        }
        public async Task<List<Category>> GetUserCategoriesEditFilePermissionAsync(int userId, CancellationToken ct)
        {
            return await _context.Categories
           .Where(c =>
            c.IsActive &&
            c.UserCategoryPermissions.Any(p =>
                p.UserId == userId &&
                p.PermissionId == 4 // EDIT FILE
            )
           )
           .AsNoTracking()
           .ToListAsync(ct);
        }

        public async Task<List<Category>> GetUserCategoriesDeleteFilePermissionAsync(int userId, CancellationToken ct)
        {
            return await _context.Categories
           .Where(c =>
            c.IsActive &&
            c.UserCategoryPermissions.Any(p =>
                p.UserId == userId &&
                p.PermissionId == 5 // DELETE FILE
            )
           )
           .AsNoTracking()
           .ToListAsync(ct);
        }

        public async Task ActivateByNameAsync(string categoryName, CancellationToken ct)
        {
            var category = await _context.Categories
    .FirstOrDefaultAsync(x => x.Name == categoryName, ct);

            if (category == null)
                throw new Exception("Category not found");

            category.Activate();

            await _context.SaveChangesAsync(ct);

        }
        public async Task<string?> GetCategoryNameAsync(
          int categoryId,
           CancellationToken ct)
          {
            return await _context.Categories
                .Where(c => c.Id == categoryId)
                .Select(c => c.Name)
                .FirstOrDefaultAsync(ct);
          }
    }
}