using Archive.Application.DTOs;
using Archive.Application.Interfaces.Services;
using Archive.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using System.Security.Claims;

namespace ArchiveSystem.API.Controllers;

[Authorize]
[ApiController]
[Route("api/files")]
public class FilesController : ControllerBase
{
    private readonly IFileService _service;

    public FilesController(IFileService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int? categoryId = null,
        [FromQuery] string? fileName = null,
        [FromQuery] string? year = null,
        [FromQuery] string? status = null,
        CancellationToken ct = default)
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var result = await _service.GetAllAsync(
            userId,
            page,
            categoryId,
            fileName,
            year,
            status,
            ct);

        return Ok(result);
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload(
    [FromForm] UploadFileDto dto,
    IFormFile file,
    CancellationToken ct)
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        using var stream = file.OpenReadStream();

        var extension = Path.GetExtension(file.FileName);

        var fileId = await _service.UploadAsync(
            dto,
            stream,
            extension,
            userId,
            ct);

        return Ok(new
        {
            FileId = fileId,
            Message = "File uploaded successfully"
        });
    }
    [HttpGet("download/{id}")]
    public async Task<IActionResult> Download(
    int id,
    CancellationToken ct)
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var file = await _service.GetFileForDownloadAsync(id, userId, ct);

        if (file == null)
            return NotFound();

        if (!System.IO.File.Exists(file.FilePath))
            return NotFound("File not found");

        var provider = new FileExtensionContentTypeProvider();

        if (!provider.TryGetContentType(file.FilePath, out var contentType))
            contentType = "application/octet-stream";

        return PhysicalFile(
            file.FilePath,
            contentType,
            file.FileName);
    }
    [HttpGet("preview/{id}")]
    public async Task<IActionResult> Preview(int id, CancellationToken ct)
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var file = await _service.GetFileForDownloadAsync(id, userId, ct);

        if (file == null)
            return NotFound();

        if (!System.IO.File.Exists(file.FilePath))
            return NotFound("File not found");

        var provider = new FileExtensionContentTypeProvider();

        if (!provider.TryGetContentType(file.FilePath, out var contentType))
            contentType = "application/octet-stream";

        Response.Headers["Content-Disposition"] = "inline";

        return PhysicalFile(file.FilePath, contentType);
    }
    [HttpPut("{id}/rename")]
    public async Task<IActionResult> Rename(
    int id,
    [FromBody] RenameFileDto dto,
    CancellationToken ct)
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        await _service.UpdateFileNameAsync(id, userId, dto.FileName, ct);

        return Ok(new
        {
            Message = "File renamed successfully"
        });
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateMetadata(
        int id,
        [FromBody] UpdateFileMetadataDto dto,
        CancellationToken ct)
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        await _service.UpdateFileMetadataAsync(id, userId, dto, ct);

        return Ok(new
        {
            Message = "File metadata updated successfully"
        });
    }

    [HttpPatch("{id}/delete")]
    public async Task<IActionResult> SoftDelete(
        int id,
        CancellationToken ct)
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        await _service.SoftDeleteFileAsync(id, userId, ct);

        return Ok(new
        {
            Message = "File deleted successfully"
        });
    }
}
//[HttpGet("redis-test")]
//public async Task<IActionResult> RedisTest([FromServices] IRedisService redis)
//{
//    var key = "test:key";

//    await redis.SetHashAsync(key, new Dictionary<string, string>
//{
//    { "hello", "world" }
//});

//    var value = await redis.GetHashValueAsync(key, "hello");

//    return Ok(new
//    {
//        RedisWorking = value == "world",
//        Value = value
//    });
//}
