using Archive.Domain.Entities;

namespace Archive.Application.Interfaces.Repositories
{
    public interface IFileRepository
    {
        Task<List<FileArchive>> GetPagedAsync(int userId,int page,int pageSize,CancellationToken ct);

        Task AddAsync(FileArchive file, CancellationToken ct);
        Task<FileArchive?> GetByIdAsync(int id, CancellationToken ct);
        Task SaveChangesAsync(CancellationToken ct);
    }
}