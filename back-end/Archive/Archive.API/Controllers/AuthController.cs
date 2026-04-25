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
        var authResponse = await _authService.LoginAsync(dto.Username, dto.Password, ct);
        return Ok(authResponse);
    }

    // =========================
    // REFRESH TOKEN
    // =========================
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(RefreshRequest request, CancellationToken ct)
    {
        var result = await _authService.RefreshAsync(request.RefreshToken, ct);

        if (result == null)
            return Unauthorized(new { message = "Invalid or expired refresh token" });

        return Ok(result);
    }

    // =========================
    // LOGOUT
    // =========================
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(RefreshRequest request, CancellationToken ct)
    {
        await _authService.LogoutAsync(request.RefreshToken, ct);
        return Ok(new { message = "Logged out successfully" });
    }

    // =========================
    // TEST TOKEN
    // =========================
    [HttpGet("me")]
    public IActionResult Me()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var username = User.FindFirst(ClaimTypes.Name)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        return Ok(new
        {
            UserId = userId,
            Username = username,
            Role = role,
            IsAuthenticated = User.Identity?.IsAuthenticated
        });
    }
}

