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

            builder.Property(x => x.PasswordHash)
                .HasMaxLength(500)
                .IsRequired();

            builder.Property(x => x.IsActive)
                .IsRequired();

            builder.HasMany(x => x.UploadedFiles)
                .WithOne(x => x.UploadedBy)
                .HasForeignKey(x => x.UploadedByUserId);
        }
    }
}
