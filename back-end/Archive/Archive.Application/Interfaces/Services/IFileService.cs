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
            CancellationToken ct);

        Task<int> UploadAsync(
           UploadFileDto dto,
           Stream fileStream,
           string extension,
           int userId,
           CancellationToken ct);
    }
}
