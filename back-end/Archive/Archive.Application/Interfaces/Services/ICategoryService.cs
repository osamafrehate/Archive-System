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
        Task CreateAsync(string name, CancellationToken ct);

        Task UpdateAsync(int userId, int categoryId, string name, CancellationToken ct);

        Task DeleteAsync(int userId, int categoryId, CancellationToken ct);
    }
}
