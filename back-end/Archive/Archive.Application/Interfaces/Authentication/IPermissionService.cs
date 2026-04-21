using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.Interfaces.Authentication
{
    public interface IPermissionService
    {
        Task<bool> HasPermissionAsync(int userId, int categoryId, string permissionName);
        Task<bool> HasAnyPermissionAsync(int userId, string permissionName);
    }
}
