using Archive.Domain.Entities;

namespace Archive.Application.Interfaces.Repositories
{
    public interface IFileRepository
    {
        Task<List<FileArchive>> GetPagedAsync(
            int userId,
            int page,
            int pageSize,
            int? categoryId = null,
            string? fileNumber = null,
            string? year = null,
            string? status = null,
            CancellationToken ct = default);

        Task AddAsync(FileArchive file, CancellationToken ct);
        Task<FileArchive?> GetByIdAsync(int id, CancellationToken ct);
        Task SaveChangesAsync(CancellationToken ct);
    }
}