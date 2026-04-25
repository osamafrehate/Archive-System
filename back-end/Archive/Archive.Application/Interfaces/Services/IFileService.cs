using Archive.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.Interfaces.Services
{
    public interface IFileService
    {
        Task<List<FileDto>> GetAllAsync(
            int userId,
            int page,
            int? categoryId = null,
            string? fileNumber = null,
            string? year = null,
            string? status = null,
            CancellationToken ct = default);

        Task<int> UploadAsync(
           UploadFileDto dto,
           Stream fileStream,
           string extension,
           int userId,
           CancellationToken ct);
        Task<DownloadFileDto?> GetFileForDownloadAsync(int fileId, int userId, CancellationToken ct);
        Task UpdateFileNameAsync(int fileId, int userId, string newFileName, CancellationToken ct);
    }
}
