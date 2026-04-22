using Archive.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.Interfaces.Repositories
{
    public interface ICategoryRepository
    {
        Task<List<Category>> GetAllAsync(CancellationToken ct);

        Task<List<Category>> GetActiveAsync(CancellationToken ct);

        Task<Category?> GetByIdAsync(int id, CancellationToken ct);

        Task AddAsync(Category category, CancellationToken ct);

        Task SaveChangesAsync(CancellationToken ct);

        Task<bool> ExistsByNameAsync(string name, CancellationToken ct);
        Task<List<Category>> GetUserCategoriesAsync(int userId, CancellationToken ct);
        Task<List<Category>> GetUserCategoriesEditPermissionAsync(int userId, CancellationToken ct);
        Task ActivateByNameAsync(string categoryName, CancellationToken ct);
        Task<string?> GetCategoryNameAsync(int categoryId, CancellationToken ct);
    }
}
