using Archive.Application.DTOs;
using Archive.Application.Interfaces.Authentication;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Archive.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    // =========================
    // REGISTER USER
    // =========================
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto, CancellationToken ct)
    {
        var result = await _authService.RegisterAsync(dto.Username, dto.Password, ct);
        return Ok(result);
    }

    // =========================
    // LOGIN
    // =========================
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto, CancellationToken ct)
    {
        var token = await _authService.LoginAsync(dto.Username, dto.Password, ct);
        return Ok(new { Token = token });
    }

    // =========================
    // TEST TOKEN
    // =========================
    [HttpGet("me")]
    public IActionResult Me()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var username = User.FindFirst(ClaimTypes.Name)?.Value;

        return Ok(new
        {
            UserId = userId,
            Username = username,
            IsAuthenticated = User.Identity?.IsAuthenticated
        });
    }
}