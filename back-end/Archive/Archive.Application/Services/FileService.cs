using Archive.Application.DTOs;
using Archive.Application.Interfaces.Authentication;
using Archive.Application.Interfaces.Repositories;
using Archive.Application.Interfaces.Services;

namespace Archive.Application.Services
{
    public class FileService : IFileService
    {
        private const int PageSize = 50;

        private readonly IFileRepository _repo;
        private readonly IPermissionService _permissionService;
        private readonly IFileStorageService _storage;
        private readonly ICategoryRepository _categoryRepo;

        public FileService(
            IFileRepository repo,
            IPermissionService permissionService,
            IFileStorageService storage,
            ICategoryRepository categoryRepo)
        {
            _repo = repo;
            _permissionService = permissionService;
            _storage = storage;
            _categoryRepo = categoryRepo;
        }

        public async Task<List<FileDto>> GetAllAsync(
            int userId,
            int page,
            int? categoryId = null,
            string? fileName = null,
            string? year = null,
            string? status = null,
            CancellationToken ct = default)
        {
            var files = await _repo.GetPagedAsync(
                userId,
                page,
                PageSize,
                categoryId,
                fileName,
                year,
                status,
                ct);

            return files.Select(file => new FileDto
            {
                Id = file.Id,
                FileNumber = file.IsDeleted ? string.Empty : file.FileNumber,
                FileName = file.FileName,
                UploadedAt = file.UploadedAt,
                InputDate = file.IsDeleted ? null : file.InputDate,
                ExpireDate = file.IsDeleted ? null : file.ExpireDate,
                CategoryId = file.CategoryId,
                CategoryName = file.Category?.Name ?? "N/A",
                UploadedByUsername = file.UploadedBy?.Username ?? "N/A",
                Amount = file.IsDeleted ? 0 : file.Amount,
                Status = file.IsDeleted ? "Deleted" : CalculateStatus(file.ExpireDate),
                IsDeleted = file.IsDeleted
            }).ToList();
        }

        public async Task<int> UploadAsync(
    UploadFileDto dto,
    Stream fileStream,
    string extension,
    int userId,
    CancellationToken ct)
        {
            var hasPermission = await _permissionService.HasPermissionAsync(
                userId,
                dto.CategoryId,
                "WRITE");

            if (!hasPermission)
                throw new Exception("No permission to upload");

            var categoryName = await _categoryRepo.GetCategoryNameAsync(
                dto.CategoryId,
                ct);

            if (categoryName == null)
                throw new Exception("Category not found");

            var filePath = await _storage.SaveFileAsync(
                categoryName,
                dto.FileName,
                dto.FileNumber,
                extension,
                fileStream,
                ct);

            var file = new Domain.Entities.FileArchive(
                userId,
                dto.CategoryId,
                dto.FileNumber,
                dto.FileName,
                dto.InputDate,
                dto.ExpireDate,
                dto.Amount,
                filePath);

            await _repo.AddAsync(file, ct);

            return file.Id;
        }

        private static string CalculateStatus(DateTime? expireDate)
        {
            if (!expireDate.HasValue)
                return "UNKNOWN";

            var days = (expireDate.Value - DateTime.UtcNow).TotalDays;

            return days <= 14 ? "RED"
                 : days <= 180 ? "YELLOW"
                 : "GREEN";
        }
        public async Task<DownloadFileDto?> GetFileForDownloadAsync(
    int fileId,
    int userId,
    CancellationToken ct)
        {
            var file = await _repo.GetByIdAsync(fileId, ct);

            if (file == null)
                return null;

            // Check if file is deleted
            if (file.IsDeleted)
                return null;

            var hasPermission = await _permissionService.HasPermissionAsync(
                userId,
                file.CategoryId,
                "READ");

            if (!hasPermission)
                throw new Exception("No permission");

            if (string.IsNullOrWhiteSpace(file.FilePath))
                throw new Exception("File path missing");

            return new DownloadFileDto
            {
                FilePath = file.FilePath,
                FileName = file.FileName
            };
        }
        public async Task UpdateFileNameAsync(
    int fileId,
    int userId,
    string newFileName,
    CancellationToken ct)
        {
            var file = await _repo.GetByIdAsync(fileId, ct);

            if (file == null)
                throw new Exception("File not found");

            var hasPermission = await _permissionService.HasPermissionAsync(
                userId,
                file.CategoryId,
                "WRITE");

            if (!hasPermission)
                throw new Exception("No permission");

            file.UpdateFileName(newFileName); 

            await _repo.SaveChangesAsync(ct);
        }

        public async Task UpdateFileMetadataAsync(
            int fileId,
            int userId,
            UpdateFileMetadataDto dto,
            CancellationToken ct)
        {
            var file = await _repo.GetByIdAsync(fileId, ct);

            if (file == null)
                throw new Exception("File not found");

            // Check for EDIT FILE permission on the file's current category
            var hasPermission = await _permissionService.HasPermissionAsync(
                userId,
                file.CategoryId,
                "EDIT FILE");

            if (!hasPermission)
                throw new Exception("No EDIT FILE permission");

            // Update fileName if provided
            if (!string.IsNullOrWhiteSpace(dto.FileName))
                file.UpdateFileName(dto.FileName);

            // Update fileNumber if provided
            if (!string.IsNullOrWhiteSpace(dto.FileNumber))
                file.UpdateFileNumber(dto.FileNumber);

            // Update categoryId if provided
            if (dto.CategoryId.HasValue && dto.CategoryId > 0)
            {
                // Verify new category exists
                var newCategory = await _categoryRepo.GetByIdAsync(dto.CategoryId.Value, ct);
                if (newCategory == null)
                    throw new Exception("New category not found");

                file.UpdateCategoryId(dto.CategoryId.Value);
            }

            // Update inputDate if provided
            if (dto.InputDate.HasValue)
                file.UpdateInputDate(dto.InputDate);

            // Update expireDate if provided
            if (dto.ExpireDate.HasValue)
                file.UpdateExpireDate(dto.ExpireDate);

            // Update amount if provided
            if (dto.Amount.HasValue)
                file.UpdateAmount(dto.Amount);

            await _repo.SaveChangesAsync(ct);
        }

        public async Task SoftDeleteFileAsync(
            int fileId,
            int userId,
            CancellationToken ct)
        {
            var file = await _repo.GetByIdAsync(fileId, ct);

            if (file == null)
                throw new Exception("File not found");

            // Check for DELETE FILE permission on the file's category
            var hasPermission = await _permissionService.HasPermissionAsync(
                userId,
                file.CategoryId,
                "DELETE FILE");

            if (!hasPermission)
                throw new Exception("No DELETE FILE permission");

            // Perform soft delete
            file.SoftDelete();

            await _repo.SaveChangesAsync(ct);
        }
    }
}