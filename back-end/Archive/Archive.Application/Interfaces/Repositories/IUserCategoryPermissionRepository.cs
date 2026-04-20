using Archive.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.Interfaces.Repositories
{
    public interface IUserCategoryPermissionRepository
    {
        Task<List<UserCategoryPermission>> GetByUserAndCategory(
           int userId,
           int categoryId,
           CancellationToken ct);

        Task AddAsync(UserCategoryPermission entity, CancellationToken ct);

        Task RemoveRange(List<UserCategoryPermission> entities, CancellationToken ct);

        Task SaveChangesAsync(CancellationToken ct);
    }
}
