using Archive.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.Interfaces.Services
{
    public interface IUserService
    {
        Task<List<UserDto>> SearchAsync(string keyword, CancellationToken ct);
    }
}
