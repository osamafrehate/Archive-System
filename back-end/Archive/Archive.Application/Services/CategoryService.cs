using Archive.Application.DTOs;
using Archive.Application.Interfaces.Authentication;
using Archive.Application.Interfaces.Repositories;
using Archive.Application.Interfaces.Services;
using Archive.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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

        public async Task CreateAsync(string name, CancellationToken ct)
        {
            var category = new Category(name);

            await _repo.AddAsync(category, ct);
            await _repo.SaveChangesAsync(ct);
        }

        public async Task UpdateAsync(int userId, int categoryId, string name, CancellationToken ct)
        {
            var hasPermission = await _permissionService.HasPermissionAsync(
                userId, categoryId, "EDIT");

            if (!hasPermission)
                throw new Exception("No EDIT permission");

            var category = await _repo.GetByIdAsync(categoryId, ct)
                ?? throw new Exception("Category not found");

            category.UpdateName(name);

            await _repo.SaveChangesAsync(ct);
        }

        public async Task DeleteAsync(int userId, int categoryId, CancellationToken ct)
        {
            var hasPermission = await _permissionService.HasPermissionAsync(
                userId, categoryId, "EDIT");

            if (!hasPermission)
                throw new Exception("No EDIT permission");

            var category = await _repo.GetByIdAsync(categoryId, ct)
                ?? throw new Exception("Category not found");

            category.Deactivate();

            await _repo.SaveChangesAsync(ct);
        }
    }
}
