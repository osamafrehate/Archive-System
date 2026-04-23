using Archive.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.Interfaces.Services
{
     public interface IAdminService
    {
        Task AssignPermissionsAsync(AssignUserPermissionsDto dto,CancellationToken ct);
         Task<UserCategoryPermissionsDto> GetUserCategoryPermissionsAsync(
         int userId,
         CancellationToken ct);
        
        }
}
