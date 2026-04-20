using Archive.Application.DTOs;
using Archive.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Archive.API.Controllers
{
    [ApiController]
    [Route("api/permissions")]
    [Authorize(Roles = "Admin")]
    public class PermissionController : ControllerBase
    {
        private readonly IPermissionServiceApp _service;

        public PermissionController(IPermissionServiceApp service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken ct)
            => Ok(await _service.GetAllAsync(ct));

        [HttpPost]
        public async Task<IActionResult> Create(CreatePermissionDto dto, CancellationToken ct)
        {
            await _service.CreateAsync(dto, ct);
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdatePermissionDto dto, CancellationToken ct)
        {
            await _service.UpdateAsync(id, dto, ct);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id, CancellationToken ct)
        {
            await _service.DeleteAsync(id, ct);
            return Ok();
        }
    }
}
