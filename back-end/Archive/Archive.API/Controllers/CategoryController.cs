using Archive.Application.DTOs;
using Archive.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Archive.API.Controllers
{
    [ApiController]
    [Route("api/categories")]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _service;

        public CategoryController(ICategoryService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize(Roles ="Admin")]
        public async Task<IActionResult> GetAll(CancellationToken ct)
        {
            var categories = await _service.GetAllAsync(ct);

            return Ok(categories);
        }
        //get Categories related to user as long as the user has Write permission on this category
        [HttpGet("UserCategories")]
        public async Task<IActionResult> GetUserCategories(CancellationToken ct)
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (claim == null)
                return Ok(new List<CategoryDto>());

            int userId = int.Parse(claim.Value);

            var result = await _service.GetUserCategoriesAsync(userId, ct);

            return Ok(result);
        }
        //get Categories related to user as long as the user has Read permission on this category
        [HttpGet("UserCategoriesReadPermission")]
        public async Task<IActionResult> GetUserCategoriesReadPermission(CancellationToken ct)
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (claim == null)
                return Ok(new List<CategoryDto>());

            int userId = int.Parse(claim.Value);

            var result = await _service.GetUserCategoriesReadPermissionAsync(userId, ct);

            return Ok(result);
        }
        //get Categories related to user as long as the user has EDIT CATEGORY permission on this category
        [HttpGet("UserCategoriesEditPermission")]
        public async Task<IActionResult> GetUserCategoriesEditPermission(CancellationToken ct)
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (claim == null)
                return Ok(new List<CategoryDto>());

            int userId = int.Parse(claim.Value);

            var result = await _service.GetUserCategoriesEditPermissionAsync(userId, ct);

            return Ok(result);
        }
        //get Categories related to user as long as the user has EDIT FILE permission on this category
        [HttpGet("UserCategoriesEditFilePermission")]
        public async Task<IActionResult> GetUserCategoriesEditFilePermission(CancellationToken ct)
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (claim == null)
                return Ok(new List<CategoryDto>());

            int userId = int.Parse(claim.Value);

            var result = await _service.GetUserCategoriesEditFilePermissionAsync(userId, ct);

            return Ok(result);
        }

        [HttpGet("UserCategoriesDeleteFilePermission")]
        public async Task<IActionResult> GetUserCategoriesDeleteFilePermission(CancellationToken ct)
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (claim == null)
                return Ok(new List<CategoryDto>());

            int userId = int.Parse(claim.Value);

            var result = await _service.GetUserCategoriesDeleteFilePermissionAsync(userId, ct);

            return Ok(result);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create(string name, CancellationToken ct)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

                await _service.CreateAsync(userId, name, ct);

                return Ok(new { message = "Category created successfully" });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"CategoryController.Create error: {ex.Message}");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, string name, CancellationToken ct)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

                await _service.UpdateAsync(userId, id, name, ct);

                return Ok(new { message = "Category updated successfully" });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"CategoryController.Update error: {ex.Message}");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id, CancellationToken ct)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

                await _service.DeleteAsync(userId, id, ct);

                return Ok(new { message = "Category deleted successfully" });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"CategoryController.Delete error: {ex.Message}");
                return BadRequest(new { error = ex.Message });
            }
        }
        [HttpPut("activate-by-name")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ActivateByName(
        [FromQuery] string name,
        CancellationToken ct)
        {
            await _service.ActivateByNameAsync(name, ct);

            return Ok(new
            {
                Message = "Category activated successfully"
            });
        }
        [HttpGet("active")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetActiveCategories(CancellationToken ct)
        {
            var result = await _service.GetActiveCategoriesAsync(ct);

            return Ok(result);
        }
    }
}