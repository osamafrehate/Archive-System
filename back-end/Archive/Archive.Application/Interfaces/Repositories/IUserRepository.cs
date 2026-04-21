using Archive.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.Interfaces.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByUsernameAsync(string username, CancellationToken ct);

        Task<User?> GetByIdAsync(int id, CancellationToken ct);

        Task<List<UserCategoryPermission>> GetUserPermissionsAsync(int userId, CancellationToken ct);
        Task AddAsync(User user, CancellationToken ct);
        Task<List<User>> SearchByUsernameAsync(string keyword, CancellationToken ct);
    }
}
