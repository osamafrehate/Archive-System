using Archive.Application.Interfaces.Repositories;
using Archive.Domain.Entities;
using Archive.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;


namespace Archive.Infrastructure.Repositories
{
    public class FileRepository :IFileRepository
    {
        private readonly ArchiveDbContext _context;

        public FileRepository(ArchiveDbContext context)
        {
            _context = context;
        }

        public async Task<List<FileArchive>> GetAllAsync(CancellationToken ct)
        {
            return await _context.Files
                .Include(x => x.Category)
                .Include(x => x.UploadedBy)
                .ToListAsync(ct);
        }
        public async Task AddAsync(FileArchive file, CancellationToken ct)
        {
            _context.Files.Add(file);
            await _context.SaveChangesAsync(ct);
        }
    }
}
