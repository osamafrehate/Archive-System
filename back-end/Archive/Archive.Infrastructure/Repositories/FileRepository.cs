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
            CancellationToken ct)
        {
            var now = DateTime.UtcNow;

            return await _context.Files
                .AsNoTracking()
                .Where(f =>
                    f.Category.IsActive &&
                    f.Category.UserCategoryPermissions.Any(p =>
                        p.UserId == userId &&
                        p.Permission.Name == "READ"))
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
    }
}