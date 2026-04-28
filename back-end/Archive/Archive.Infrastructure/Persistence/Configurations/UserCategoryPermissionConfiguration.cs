using Archive.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Infrastructure.Persistence.Configurations
{
    public class UserCategoryPermissionConfiguration : IEntityTypeConfiguration<UserCategoryPermission>
    {
        public void Configure(EntityTypeBuilder<UserCategoryPermission> builder)
        {
            builder.ToTable("USER_CATEGORY_PERMISSIONS");

            builder.HasKey(x => new { x.UserId, x.CategoryId, x.PermissionId });

            // ✅ OPTIMIZED: Strategic composite index for permission validation
            // Query: WHERE UserId = ? AND CategoryId = ?
            // Usage: "Does user have permission for this category?" (common in GetPagedAsync)
            // Better selectivity than UserId alone
            builder.HasIndex(x => new { x.UserId, x.CategoryId })
                .HasDatabaseName("IX_USER_CATEGORY_PERMISSIONS_UserId_CategoryId");

            // ✅ PRESERVED: Index for "get all permissions for user"
            // Query: WHERE UserId = ?
            // Usage: GetUserPermissionsAsync, user permission check flows
            builder.HasIndex(x => x.UserId)
                .HasDatabaseName("IX_USER_CATEGORY_PERMISSIONS_UserId");

            // ✅ PRESERVED: Index for reverse lookup
            // Query: WHERE PermissionId = ?
            // Usage: Admin queries, "who has this permission" lookups
            builder.HasIndex(x => x.PermissionId)
                .HasDatabaseName("IX_USER_CATEGORY_PERMISSIONS_PermissionId");

            // FK INDEX: CategoryId foreign key constraint
            // Query: Used for FK constraint validation + cascade delete operations
            // Auto-created by EF Core, explicitly defined here for clarity
            builder.HasIndex(x => x.CategoryId)
                .HasDatabaseName("IX_USER_CATEGORY_PERMISSIONS_CategoryId");

            builder.HasOne(x => x.User)
                .WithMany(x => x.UserCategoryPermissions)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Category)
                .WithMany(x => x.UserCategoryPermissions)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);

            // ✅ CRITICAL FIX: Changed from Cascade to Restrict
            // If a permission is deleted, don't cascade-delete all user category permissions
            // This prevents data loss if permission is accidentally deleted
            builder.HasOne(x => x.Permission)
                .WithMany(x => x.UserCategoryPermissions)
                .HasForeignKey(x => x.PermissionId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
