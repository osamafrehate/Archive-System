using Archive.Application.DTOs;
using Archive.Application.Interfaces.Authentication;
using Archive.Application.Interfaces.Repositories;
using Archive.Application.Interfaces.Services;
using Archive.Domain.Entities;

namespace Archive.API.Services
{


    public class FileService : IFileService

    {
        private readonly IFileRepository _repo;
        private readonly IPermissionService _permissionService;

        public FileService(IFileRepository repo, IPermissionService permissionService)
        {
            _repo = repo;
            _permissionService = permissionService;
        }

        //public async Task<List<FileDto>> GetAllAsync(CancellationToken ct)
        //{
        //    var files = await _repo.GetAllAsync(ct);

        //    return files.Select(x => new FileDto
        //    {
        //        Id = x.Id,
        //        FileNumber = x.FileNumber,
        //        FileName = x.FileName,
        //        UploadedAt = x.UploadedAt,
        //        CategoryName = x.Category.Name,
        //        UploadedByUsername = x.UploadedBy.Username,
        //        Status = CalculateStatus(x.ExpireDate),
        //        Amount= x.Amount,
        //    }).ToList();
        //}
        public async Task<List<FileDto>> GetAllAsync(int userId, CancellationToken ct)
        {
            var files = await _repo.GetAllAsync(ct);

            var result = new List<FileDto>();

            foreach (var file in files)
            {
                var hasAccess = await _permissionService.HasPermissionAsync(
                    userId,
                    file.CategoryId,
                    "READ"
                );

                if (!hasAccess)
                    continue;

                result.Add(new FileDto
                {
                    Id = file.Id,
                    FileNumber = file.FileNumber,
                    FileName = file.FileName,
                    UploadedAt = file.UploadedAt,
                    CategoryName = file.Category.Name,
                    UploadedByUsername = file.UploadedBy.Username,
                    Amount = file.Amount,
                    Status = CalculateStatus(file.ExpireDate)
                });
            }

            return result;
        }
        private string CalculateStatus(DateTime? expireDate)
        {
            if (!expireDate.HasValue)
                return "UNKNOWN";

            var days = (expireDate.Value - DateTime.UtcNow).TotalDays;

            if (days <= 14)
                return "RED";

            if (days <= 180)
                return "YELLOW";

            return "GREEN";
        }
        //public async Task<int> UploadAsync(UploadFileDto dto, int userId, CancellationToken ct)
        //{
        //    var file = new FileArchive(
        //        userId,
        //        dto.CategoryId,
        //        dto.FileNumber,
        //        dto.FileName,
        //        dto.InputDate,
        //        dto.ExpireDate,
        //        dto.Amount,
        //        null // FilePath لاحقاً
        //    );

        //    await _repo.AddAsync(file, ct);

        //    return file.Id;
        //}
        public async Task<int> UploadAsync(UploadFileDto dto, int userId, CancellationToken ct)
        {
            var hasPermission = await _permissionService.HasPermissionAsync(
                userId,
                dto.CategoryId,
                "WRITE"
            );

            if (!hasPermission)
                throw new Exception("You do not have permission to upload in this category");

            var file = new FileArchive(
                userId,
                dto.CategoryId,
                dto.FileNumber,
                dto.FileName,
                dto.InputDate,
                dto.ExpireDate,
                dto.Amount,
                null
            );

            await _repo.AddAsync(file, ct);

            return file.Id;
        }
    }
}
