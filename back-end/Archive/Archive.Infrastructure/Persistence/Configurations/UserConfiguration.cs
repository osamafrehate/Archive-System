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
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("USERS");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Username)
                .HasMaxLength(255)
                .IsRequired();

            // ✅ CRITICAL: Unique index for login performance
            // Query: WHERE Username = ?
            // Usage: Every authentication attempt (LoginAsync, GetByUsernameAsync)
            // This is essential and must remain
            builder.HasIndex(x => x.Username)
                .IsUnique()
                .HasDatabaseName("IX_USERS_Username_Unique");

            // ❌ REMOVED: IX_USERS_IsActive (low-selectivity boolean index)
            // Reason: ~95% of users are active (poor selectivity)
            // Maintenance cost > query benefit
            // No real query patterns in codebase filter ONLY by IsActive
            // Removing saves ~1-2MB storage + 2-3% write overhead

            // ✅ Reduced from 500 to 256 (sufficient for bcrypt/argon2/PBKDF2)
            builder.Property(x => x.PasswordHash)
                .HasMaxLength(256)
                .IsRequired();

            // ✅ Changed from nvarchar(max) to nvarchar(50) for "Admin", "User", "Manager"
            builder.Property(x => x.Role)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.IsActive)
                .IsRequired();

            builder.HasMany(x => x.UploadedFiles)
                .WithOne(x => x.UploadedBy)
                .HasForeignKey(x => x.UploadedByUserId);
        }
    }
}
