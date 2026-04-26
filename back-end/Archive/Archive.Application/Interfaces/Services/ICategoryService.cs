using Archive.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.Interfaces.Services
{
    public interface ICategoryService
    {
        Task<List<CategoryDto>> GetAllAsync(CancellationToken ct);

        Task CreateAsync(int userId, string name, CancellationToken ct);

        Task UpdateAsync(int userId, int categoryId, string name, CancellationToken ct);

        Task DeleteAsync(int userId, int categoryId, CancellationToken ct);
        Task<List<CategoryDto>> GetUserCategoriesAsync(int userId, CancellationToken ct);
        Task<List<CategoryDto>> GetUserCategoriesReadPermissionAsync(int userId, CancellationToken ct);
        Task<List<CategoryDto>> GetUserCategoriesEditPermissionAsync(int userId, CancellationToken ct);
        Task<List<CategoryDto>> GetActiveCategoriesAsync(CancellationToken ct);
        Task ActivateByNameAsync(string categoryName, CancellationToken ct);
    }
}
