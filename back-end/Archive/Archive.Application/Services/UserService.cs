using Archive.Application.DTOs;
using Archive.Application.Interfaces.Repositories;
using Archive.Application.Interfaces.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _repo;

        public UserService(IUserRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<UserDto>> SearchAsync(string keyword, CancellationToken ct)
        {
            var users = await _repo.SearchByUsernameAsync(keyword, ct);

            return users.Select(x => new UserDto
            {
                Id = x.Id,
                Username = x.Username
            }).ToList();
        }
    }
}
