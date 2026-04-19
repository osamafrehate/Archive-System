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

            builder.HasOne(x => x.User)
                .WithMany(x => x.UserCategoryPermissions)
                .HasForeignKey(x => x.UserId);

            builder.HasOne(x => x.Category)
                .WithMany(x => x.UserCategoryPermissions)
                .HasForeignKey(x => x.CategoryId);

            builder.HasOne(x => x.Permission)
                .WithMany(x => x.UserCategoryPermissions)
                .HasForeignKey(x => x.PermissionId);
        }
    }
}
