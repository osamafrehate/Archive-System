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
    public class FileConfiguration : IEntityTypeConfiguration<FileArchive>
    {
        public void Configure(EntityTypeBuilder<FileArchive> builder)
        {
            builder.ToTable("FILES");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.FileNumber).HasMaxLength(255).IsRequired();
            builder.Property(x => x.FileName).HasMaxLength(255).IsRequired();

            builder.Property(x => x.Amount).HasColumnType("decimal(18,2)");

            builder.Property(x => x.FilePath).HasMaxLength(1000);

            builder.Property(x => x.UploadedAt).IsRequired();

            builder.HasOne(x => x.UploadedBy)
                .WithMany(x => x.UploadedFiles)
                .HasForeignKey(x => x.UploadedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Category)
                .WithMany(x => x.Files)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
            builder.Property(x => x.Amount)
                .HasColumnType("decimal(18,2)")
                 .IsRequired(false);
        }
    }
}
