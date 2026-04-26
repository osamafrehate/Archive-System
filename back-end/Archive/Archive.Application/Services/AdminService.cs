using Archive.Application.DTOs;
using Archive.Application.Interfaces.Repositories;
using Archive.Application.Interfaces.Services;
using Archive.Domain.Entities;
using System.Data;


namespace Archive.Application.Services
{
    public class AdminService : IAdminService
    {
        private readonly IUserCategoryPermissionRepository _repo;
        private readonly IUserRepository _userRepo;
        private readonly IPermissionRepository _permissionRepo;

        public AdminService(
            IUserCategoryPermissionRepository repo,
            IPermissionRepository permissionRepo,
            IUserRepository userRepo)
        {
            _repo = repo;
            _permissionRepo = permissionRepo;
            _userRepo = userRepo;
        }

        /// <summary>
        /// Atomically assigns permissions to a user in a single SQL transaction.
        /// Flattens the DTO into a DataTable and executes a single repository call
        /// that deletes all existing permissions and inserts new ones.
        /// 
        /// This is a complete state replacement operation:
        /// - All existing permissions are deleted
        /// - All new permissions from the DTO are inserted
        /// - Everything happens in one transaction (all or nothing)
        /// </summary>
        public async Task AssignPermissionsAsync(
            AssignUserPermissionsDto dto,
            CancellationToken ct)
        {
            // Validate user exists
            var user = await _userRepo.GetByIdAsync(dto.UserId, ct);
            if (user == null)
                throw new Exception($"User with ID {dto.UserId} not found");

            // Flatten DTO to DataTable with schema: CategoryId, PermissionName
            var permissionsDataTable = FlattenPermissionsDto(dto);

            // Single repository call - executes one transaction with DELETE + INSERT
            await _repo.ReplaceUserPermissionsAsync(dto.UserId, permissionsDataTable, ct);
        }

        /// <summary>
        /// Converts the nested DTO structure into a flat DataTable for bulk assignment.
        /// 
        /// Input DTO example:
        /// Categories[0]: { CategoryId: 1, IsSelected: true, Permissions: ["Read", "Write"] }
        /// Categories[1]: { CategoryId: 2, IsSelected: true, Permissions: ["Read"] }
        /// Categories[2]: { CategoryId: 3, IsSelected: false, ... }  <- Ignored
        /// 
        /// Output DataTable:
        /// | CategoryId | PermissionName |
        /// |----------- |----------------|
        /// | 1          | Read           |
        /// | 1          | Write          |
        /// | 2          | Read           |
        /// </summary>
        private DataTable FlattenPermissionsDto(AssignUserPermissionsDto dto)
        {
            var dataTable = new DataTable();
            dataTable.Columns.Add("CategoryId", typeof(int));
            dataTable.Columns.Add("PermissionName", typeof(string));

            // Only include selected categories and their permissions
            foreach (var category in dto.Categories ?? new List<CategoryPermissionDto>())
            {
                // Skip deselected categories
                if (!category.IsSelected)
                    continue;

                // Add each permission for this category
                var permissions = category.Permissions ?? new List<string>();
                foreach (var permissionName in permissions)
                {
                    dataTable.Rows.Add(category.CategoryId, permissionName);
                }
            }

            return dataTable;
        }

        public async Task<UserCategoryPermissionsDto> GetUserCategoryPermissionsAsync(
           int userId,
           int? categoryId,
           CancellationToken ct)
        {
            var data = await _userRepo.GetUserCategoryPermissionsAsync(userId, categoryId, ct);

            var result = data
                .GroupBy(x => new { x.CategoryId, x.Category.Name })
                .Select(g => new CategoryPermissionsDto
                {
                    CategoryId = g.Key.CategoryId,
                    CategoryName = g.Key.Name,
                    Permissions = g.ToDictionary(
                        x => x.Permission.Name,
                        x => true
                    )
                })
                .ToList();

            return new UserCategoryPermissionsDto
            {
                UserId = userId,
                Categories = result
            };
        }
    }
}