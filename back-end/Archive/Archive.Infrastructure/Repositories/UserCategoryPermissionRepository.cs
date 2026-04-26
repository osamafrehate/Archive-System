
using Archive.Application.Interfaces.Repositories;
using Archive.Domain.Entities;
using Archive.Infrastructure.Persistence;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Infrastructure.Repositories
{
    public class UserCategoryPermissionRepository : IUserCategoryPermissionRepository
    {
        private readonly ArchiveDbContext _context;
        

        public UserCategoryPermissionRepository(
            ArchiveDbContext context)
        {
            _context = context;
        }
        private string _connectionString =>
       _context.Database.GetConnectionString()!;
        /// <summary>
        /// Atomically replaces user permissions in a single SQL transaction.
        /// Deletes all existing permissions for the user and inserts new ones.
        /// Everything succeeds or everything rolls back - no partial state.
        /// </summary>
        public async Task ReplaceUserPermissionsAsync(int userId, DataTable permissions, CancellationToken ct)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync(ct);

                using (var transaction = connection.BeginTransaction(System.Data.IsolationLevel.ReadCommitted))
                {
                    try
                    {
                        // STEP 1: Delete all existing permissions for this user
                        using (var deleteCmd = new SqlCommand(
                            "DELETE FROM [USER_CATEGORY_PERMISSIONS] WHERE [UserId] = @UserId",
                            connection,
                            transaction))
                        {
                            deleteCmd.Parameters.AddWithValue("@UserId", userId);
                            deleteCmd.CommandTimeout = 30;
                            await deleteCmd.ExecuteNonQueryAsync(ct);
                        }

                        // STEP 2: Insert all new permissions
                        // Each row in the DataTable represents one permission assignment
                        // We look up the PermissionId by joining with PERMISSIONS table
                        foreach (DataRow row in permissions.Rows)
                        {
                            int categoryId = (int)row["CategoryId"];
                            string permissionName = (string)row["PermissionName"];

                            using (var insertCmd = new SqlCommand(
                                @"INSERT INTO [USER_CATEGORY_PERMISSIONS] ([UserId], [CategoryId], [PermissionId])
                                  SELECT @UserId, @CategoryId, [Id]
                                  FROM [PERMISSIONS]
                                  WHERE [Name] = @PermissionName",
                                connection,
                                transaction))
                            {
                                insertCmd.Parameters.AddWithValue("@UserId", userId);
                                insertCmd.Parameters.AddWithValue("@CategoryId", categoryId);
                                insertCmd.Parameters.AddWithValue("@PermissionName", permissionName);
                                insertCmd.CommandTimeout = 60;
                                await insertCmd.ExecuteNonQueryAsync(ct);
                            }
                        }

                        // STEP 3: Commit transaction
                        transaction.Commit();
                    }
                    catch
                    {
                        // Automatic rollback on exception
                        transaction.Rollback();
                        throw;
                    }
                }
            }
        }

        // Legacy methods - kept for backward compatibility with other parts of the codebase
        public async Task<List<UserCategoryPermission>> GetByUserAndCategory(
            int userId,
            int categoryId,
            CancellationToken ct)
        {
            return await _context.UserCategoryPermissions
                .Include(x => x.Permission)
                .Where(x => x.UserId == userId && x.CategoryId == categoryId)
                .ToListAsync(ct);
        }

        public async Task AddAsync(UserCategoryPermission entity, CancellationToken ct)
        {
            await _context.UserCategoryPermissions.AddAsync(entity, ct);
        }

        public Task RemoveRange(List<UserCategoryPermission> entities, CancellationToken ct)
        {
            _context.UserCategoryPermissions.RemoveRange(entities);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync(CancellationToken ct)
        {
            await _context.SaveChangesAsync(ct);
        }
    }
}
