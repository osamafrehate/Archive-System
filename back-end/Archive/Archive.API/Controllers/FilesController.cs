using Archive.Application.DTOs;
using Archive.Application.Interfaces.Caching;
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
    [Authorize]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var result = await _service.GetAllAsync(userId, ct);

        return Ok(result);
    }
    /// <summary>
    /// //////////////////////////
    /// </summary>
    /// <param name="dto"></param>
    /// <param name="ct"></param>
    /// <returns></returns>
    [Authorize]
    [HttpPost("upload")]
    public async Task<IActionResult> Upload(
    UploadFileDto dto,
    CancellationToken ct)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized();

        int userId = int.Parse(userIdClaim);

        var fileId = await _service.UploadAsync(dto, userId, ct);

        return Ok(new
        {
            FileId = fileId,
            Message = "File uploaded successfully"
        });
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
}