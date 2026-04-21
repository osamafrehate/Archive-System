using Archive.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.Interfaces.Services
{
    public interface IPermissionServiceApp
    {
        Task<List<PermissionDto>> GetAllAsync(CancellationToken ct);

        Task CreateAsync(CreatePermissionDto dto, CancellationToken ct);

        Task UpdateAsync(int id, UpdatePermissionDto dto, CancellationToken ct);

        Task DeleteAsync(int id, CancellationToken ct);
        
    }
}
