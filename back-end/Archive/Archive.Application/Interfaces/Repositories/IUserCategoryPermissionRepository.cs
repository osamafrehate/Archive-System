using Archive.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.Interfaces.Repositories
{
    public interface IUserCategoryPermissionRepository
    {
        /// <summary>
        /// Atomically replaces all user permissions using a single SQL transaction.
        /// Deletes all existing permissions and inserts new ones in one transactional operation.
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <param name="permissions">DataTable with columns: CategoryId (int), PermissionName (nvarchar)</param>
        /// <param name="ct">Cancellation token</param>
        Task ReplaceUserPermissionsAsync(int userId, DataTable permissions, CancellationToken ct);

        // Legacy methods - kept for backward compatibility
        Task<List<UserCategoryPermission>> GetByUserAndCategory(
           int userId,
           int categoryId,
           CancellationToken ct);

        Task AddAsync(UserCategoryPermission entity, CancellationToken ct);

        Task RemoveRange(List<UserCategoryPermission> entities, CancellationToken ct);

        Task SaveChangesAsync(CancellationToken ct);
    }
}
