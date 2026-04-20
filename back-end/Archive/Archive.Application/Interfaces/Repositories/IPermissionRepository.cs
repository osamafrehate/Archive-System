using Archive.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.Interfaces.Repositories
{
    public interface IPermissionRepository
    {
        Task<List<Permission>> GetAllAsync(CancellationToken ct);

        Task<Permission?> GetByIdAsync(int id, CancellationToken ct);

        Task<Permission?> GetByNameAsync(string name, CancellationToken ct);

        Task AddAsync(Permission permission, CancellationToken ct);

        void Remove(Permission permission);

        Task RemoveFromUserCategories(int permissionId, CancellationToken ct);

        Task SaveChangesAsync(CancellationToken ct);
    }
}
