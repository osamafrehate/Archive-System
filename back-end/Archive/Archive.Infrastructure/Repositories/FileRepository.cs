using Archive.Application.Interfaces.Repositories;
using Archive.Domain.Entities;
using Archive.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Archive.Infrastructure.Repositories
{
    public class FileRepository : IFileRepository
    {
        private readonly ArchiveDbContext _context;

        public FileRepository(ArchiveDbContext context)
        {
            _context = context;
        }

        public async Task<List<FileArchive>> GetPagedAsync(
            int userId,
            int page,
            int pageSize,
            int? categoryId = null,
            string? fileNumber = null,
            string? year = null,
            string? status = null,
            CancellationToken ct = default)
        {
            var now = DateTime.UtcNow;

            var query = _context.Files
                .AsNoTracking()
                .Where(f =>
                    f.Category.IsActive &&
                    f.Category.UserCategoryPermissions.Any(p =>
                        p.UserId == userId &&
                        p.Permission.Name == "READ"));

            // Apply category filter (exact match)
            if (categoryId.HasValue)
            {
                query = query.Where(f => f.CategoryId == categoryId.Value);
            }

            // Apply file number filter (partial search)
            if (!string.IsNullOrEmpty(fileNumber))
            {
                query = query.Where(f => f.FileNumber.Contains(fileNumber));
            }

            // Apply year filter on InputDate (text-based search)
            if (!string.IsNullOrEmpty(year))
            {
                if (int.TryParse(year, out int yearValue))
                {
                    var startDate = new DateTime(yearValue, 1, 1);
                    var endDate = startDate.AddYears(1);
                    query = query.Where(f => f.InputDate >= startDate && f.InputDate < endDate);
                }
            }

            // Apply status filter
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(f =>
                    (status == "RED" && f.ExpireDate.HasValue && 
                        EF.Functions.DateDiffDay(now, f.ExpireDate.Value) <= 14) ||
                    (status == "YELLOW" && f.ExpireDate.HasValue && 
                        EF.Functions.DateDiffDay(now, f.ExpireDate.Value) > 14 && 
                        EF.Functions.DateDiffDay(now, f.ExpireDate.Value) <= 180) ||
                    (status == "GREEN" && 
                        (!f.ExpireDate.HasValue || EF.Functions.DateDiffDay(now, f.ExpireDate.Value) > 180)) ||
                    (status == "UNKNOWN" && !f.ExpireDate.HasValue));
            }

            return await query
                .Select(f => new
                {
                    File = f,
                    RemainingDays = f.ExpireDate.HasValue
                        ? EF.Functions.DateDiffDay(now, f.ExpireDate.Value)
                        : int.MaxValue
                })
                .OrderBy(x =>
                    x.RemainingDays <= 14 ? 1 :
                    x.RemainingDays <= 180 ? 2 : 3)
                .ThenBy(x => x.RemainingDays)
                .ThenByDescending(x => x.File.UploadedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => x.File)
                .Include(x => x.Category)
                .Include(x => x.UploadedBy)
                .ToListAsync(ct);
        }

        public async Task AddAsync(FileArchive file, CancellationToken ct)
        {
            await _context.Files.AddAsync(file, ct);
            await _context.SaveChangesAsync(ct);
        }
        public async Task<FileArchive?> GetByIdAsync(int id, CancellationToken ct)
        {
            return await _context.Files
                .Include(f => f.Category)
                .FirstOrDefaultAsync(f => f.Id == id, ct);
        }
        public async Task SaveChangesAsync(CancellationToken ct)
        {
            await _context.SaveChangesAsync(ct);
        }
    }
}