using Archive.Application.DTOs;
using Archive.Application.Interfaces.Authentication;
using Archive.Application.Interfaces.Repositories;
using Archive.Application.Interfaces.Services;
using Archive.Domain.Entities;

namespace Archive.Application.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _repo;
        private readonly IPermissionService _permissionService;

        public CategoryService(
            ICategoryRepository repo,
            IPermissionService permissionService)
        {
            _repo = repo;
            _permissionService = permissionService;
        }

        public async Task<List<CategoryDto>> GetAllAsync(CancellationToken ct)
        {
            var categories = await _repo.GetAllAsync(ct);

            return categories.Select(x => new CategoryDto
            {
                Id = x.Id,
                Name = x.Name,
                IsActive = x.IsActive,

            }).ToList();
        }

        public async Task CreateAsync(int userId, string name, CancellationToken ct)
        {
            //var hasEdit = await _permissionService.HasAnyPermissionAsync(userId, "EDIT");

            //if (!hasEdit)
            //    throw new Exception("No EDIT permission");

            var exists = await _repo.ExistsByNameAsync(name, ct);

            if (exists)
                throw new Exception("Category name already exists");

            var category = new Category(name);

            await _repo.AddAsync(category, ct);
            await _repo.SaveChangesAsync(ct);
        }

        public async Task UpdateAsync(int userId, int categoryId, string name, CancellationToken ct)
        {
            var hasPermission = await _permissionService.HasPermissionAsync(
                userId, categoryId, "EDIT CATEGORY");

            if (!hasPermission)
                throw new Exception("No EDIT CATEGORY permission");

            var category = await _repo.GetByIdAsync(categoryId, ct)
                ?? throw new Exception("Category not found");

            var exists = await _repo.ExistsByNameAsync(name, ct);

            if (exists && category.Name != name)
                throw new Exception("Category name already exists");

            category.UpdateName(name);

            await _repo.SaveChangesAsync(ct);
        }

        public async Task DeleteAsync(int userId, int categoryId, CancellationToken ct)
        {
            var hasPermission = await _permissionService.HasPermissionAsync(
                userId, categoryId, "EDIT CATEGORY");

            if (!hasPermission)
                throw new Exception("No EDIT CATEGORY permission");

            var category = await _repo.GetByIdAsync(categoryId, ct)
                ?? throw new Exception("Category not found");

            category.Deactivate();

            await _repo.SaveChangesAsync(ct);
        }
        public async Task<List<CategoryDto>> GetUserCategoriesAsync(int userId, CancellationToken ct)
        {
            var categories = await _repo.GetUserCategoriesAsync(userId, ct);

            return categories.Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                IsActive = c.IsActive,
            }).ToList();
        }
        public async Task<List<CategoryDto>> GetUserCategoriesReadPermissionAsync(int userId, CancellationToken ct)
        {
            var categories = await _repo.GetUserCategoriesReadPermissionAsync(userId, ct);

            return categories.Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                IsActive = c.IsActive,
            }).ToList();
        }
        public async Task<List<CategoryDto>> GetUserCategoriesEditPermissionAsync(int userId, CancellationToken ct)
        {
            var categories = await _repo.GetUserCategoriesEditPermissionAsync(userId, ct);

            return categories.Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                IsActive = c.IsActive,
            }).ToList();
        }
        public async Task<List<CategoryDto>> GetUserCategoriesEditFilePermissionAsync(int userId, CancellationToken ct)
        {
            var categories = await _repo.GetUserCategoriesEditFilePermissionAsync(userId, ct);

            return categories.Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                IsActive = c.IsActive,
            }).ToList();
        }

        public async Task<List<CategoryDto>> GetUserCategoriesDeleteFilePermissionAsync(int userId, CancellationToken ct)
        {
            var categories = await _repo.GetUserCategoriesDeleteFilePermissionAsync(userId, ct);

            return categories.Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                IsActive = c.IsActive,
            }).ToList();
        }

        public async Task ActivateByNameAsync(string categoryName, CancellationToken ct)
        {
            await _repo.ActivateByNameAsync(categoryName, ct);
        }
        public async Task<List<CategoryDto>> GetActiveCategoriesAsync(CancellationToken ct)
        {
            var categories = await _repo.GetActiveAsync(ct);

            return categories.Select(x => new CategoryDto
            {
                Id = x.Id,
                Name = x.Name,
                IsActive = x.IsActive
            }).ToList();
        }
    }
}