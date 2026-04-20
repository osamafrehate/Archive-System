using Archive.Application.DTOs;
using Archive.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Archive.API.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")] 
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpPost("assign-permissions")]
        public async Task<IActionResult> AssignPermissions(
            AssignUserPermissionsDto dto,
            CancellationToken ct)
        {
            await _adminService.AssignPermissionsAsync(dto, ct);

            return Ok("Permissions updated successfully");
        }
    }
}