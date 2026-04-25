using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.Interfaces.Authentication
{
    public interface IJwtTokenService
    {
        string GenerateToken(int userId, string username, string role);
        string CreateRefreshToken();
    }
}
