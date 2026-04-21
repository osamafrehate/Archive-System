using Archive.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Archive.API.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _service;

        public UsersController(IUserService service)
        {
            _service = service;
        }

        [HttpGet("search")]
        [Authorize(Roles ="Admin")]
        public async Task<IActionResult> Search(string keyword, CancellationToken ct)
        {
            var result = await _service.SearchAsync(keyword, ct);

            return Ok(result);
        }
    }
}
