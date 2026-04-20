//using Archive.Application.DTOs;
//using Archive.Application.Interfaces.Repositories;
//using Archive.Application.Interfaces.Services;
//using Archive.Domain.Entities;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace Archive.Application.Services
//{
//    public class AdminService : IAdminService
//    {
//        private readonly IUserCategoryPermissionRepository _repo;
//        private readonly IPermissionRepository _permissionRepo;

//        public AdminService(
//            IUserCategoryPermissionRepository repo,
//            IPermissionRepository permissionRepo)
//        {
//            _repo = repo;
//            _permissionRepo = permissionRepo;
//        }

//        public async Task AssignPermissionsAsync(AssignUserPermissionsDto dto, CancellationToken ct)
//        {
//            foreach (var category in dto.Categories)
//            {
//                var existing = await _repo.GetByUserAndCategory(dto.UserId, category.CategoryId, ct);

//                if (!category.IsSelected)
//                {
//                    await _repo.RemoveRange(existing, ct);
//                    continue;
//                }

//                var existingPermissions = existing
//                    .Select(x => x.Permission.Name)
//                    .ToList();

//                var requestedPermissions = category.Permissions ?? new List<string>();

//                foreach (var perm in requestedPermissions)
//                {
//                    if (!existingPermissions.Contains(perm))
//                    {
//                        var permissionEntity = await _permissionRepo.GetByNameAsync(perm, ct);

//                        if (permissionEntity == null)
//                            throw new Exception($"Permission '{perm}' not found");

//                        var newRelation = new UserCategoryPermission(
//                            dto.UserId,
//                            category.CategoryId,
//                            permissionEntity.Id
//                        );

//                        await _repo.AddAsync(newRelation, ct);
//                    }
//                }

//                var toRemove = existing
//                    .Where(x => !requestedPermissions.Contains(x.Permission.Name))
//                    .ToList();

//                if (toRemove.Any())
//                    await _repo.RemoveRange(toRemove, ct);
//            }
//        }
//    }
//    }
///////////////////////////////////////////////////////////
/////
///
using Archive.Application.DTOs;
using Archive.Application.Interfaces.Repositories;
using Archive.Application.Interfaces.Services;
using Archive.Domain.Entities;


namespace Archive.Application.Services
{
    public class AdminService : IAdminService
    {
        private readonly IUserCategoryPermissionRepository _repo;
        private readonly IPermissionRepository _permissionRepo;

        public AdminService(
            IUserCategoryPermissionRepository repo,
            IPermissionRepository permissionRepo)
        {
            _repo = repo;
            _permissionRepo = permissionRepo;
        }

        public async Task AssignPermissionsAsync(
            AssignUserPermissionsDto dto,
            CancellationToken ct)
        {
            foreach (var category in dto.Categories)
            {
                var existing = await _repo.GetByUserAndCategory(
                    dto.UserId,
                    category.CategoryId,
                    ct);

                if (!category.IsSelected)
                {
                    await _repo.RemoveRange(existing, ct);
                    await _repo.SaveChangesAsync(ct);
                    continue;
                }

                var existingPermissions = existing
                    .Select(x => x.Permission.Name)
                    .ToList();

                var requestedPermissions = category.Permissions ?? new List<string>();

                foreach (var perm in requestedPermissions)
                {
                    if (!existingPermissions.Contains(perm))
                    {
                        var permissionEntity = await _permissionRepo
                            .GetByNameAsync(perm, ct);

                        var newRelation = new UserCategoryPermission(
                            dto.UserId,
                            category.CategoryId,
                            permissionEntity.Id);

                        await _repo.AddAsync(newRelation, ct);
                    }
                }

                var toRemove = existing
                    .Where(x => !requestedPermissions.Contains(x.Permission.Name))
                    .ToList();

                if (toRemove.Any())
                    await _repo.RemoveRange(toRemove, ct);

                await _repo.SaveChangesAsync(ct);
            }
        }
    }
}