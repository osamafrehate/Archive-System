using Archive.Application.Interfaces.Repositories;
using Archive.Domain.Entities;
using Archive.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
            return await _context.Categories.ToListAsync(ct);
        }

        public async Task<Category?> GetByIdAsync(int id, CancellationToken ct)
        {
            return await _context.Categories.FindAsync(new object[] { id }, ct);
        }

        public async Task AddAsync(Category category, CancellationToken ct)
        {
            await _context.Categories.AddAsync(category, ct);
        }

        public async Task SaveChangesAsync(CancellationToken ct)
        {
            await _context.SaveChangesAsync(ct);
        }
    }
}
