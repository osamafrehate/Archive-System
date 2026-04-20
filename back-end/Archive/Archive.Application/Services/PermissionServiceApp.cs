using Archive.Application.DTOs;
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
     public class PermissionServiceApp : IPermissionServiceApp
    {
        private readonly IPermissionRepository _repo;

        public PermissionServiceApp(IPermissionRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<PermissionDto>> GetAllAsync(CancellationToken ct)
        {
            var data = await _repo.GetAllAsync(ct);

            return data.Select(x => new PermissionDto
            {
                Id = x.Id,
                Name = x.Name
            }).ToList();
        }

        public async Task CreateAsync(CreatePermissionDto dto, CancellationToken ct)
        {
            var exists = await _repo.GetByNameAsync(dto.Name, ct);

            if (exists != null)
                throw new Exception("Permission already exists");

            var permission = new Permission(dto.Name);

            await _repo.AddAsync(permission, ct);
            await _repo.SaveChangesAsync(ct);
        }

        public async Task UpdateAsync(int id, UpdatePermissionDto dto, CancellationToken ct)
        {
            var permission = await _repo.GetByIdAsync(id, ct)
                ?? throw new Exception("Permission not found");

            permission.UpdateName(dto.Name);

            await _repo.SaveChangesAsync(ct);
        }

        public async Task DeleteAsync(int id, CancellationToken ct)
        {
            var permission = await _repo.GetByIdAsync(id, ct)
                ?? throw new Exception("Permission not found");

            await (_repo as dynamic).RemoveFromUserCategories(id, ct);

            _repo.Remove(permission);

            await _repo.SaveChangesAsync(ct);
        }
    }
}
