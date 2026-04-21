using Archive.Application.DTOs;
using Archive.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
        CancellationToken ct = default)
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var result = await _service.GetAllAsync(userId, page, ct);

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
