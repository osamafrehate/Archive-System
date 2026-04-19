using Archive.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.Interfaces.Repositories
{
    public interface IFileRepository
    {
        Task<List<FileArchive>> GetAllAsync(CancellationToken ct);
        Task AddAsync(FileArchive file, CancellationToken ct);
    }
}
