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
        Task<Category?> GetByIdAsync(int id, CancellationToken ct);

        Task AddAsync(Category category, CancellationToken ct);

        Task SaveChangesAsync(CancellationToken ct);
    }
}
