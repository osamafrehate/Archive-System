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

            // ✅ OPTIMIZED: Production-grade indexes for Archive system
            // Removed: IX_FILES_ExpireDate (redundant - covered by composite IX_FILES_CategoryId_ExpireDate)
            // Removed: IX_FILES_InputDate (should be composite with CategoryId)
            // Rationale: These single-column indexes had lower selectivity and maintenance cost > benefit
            
            // PRIMARY: Supports CategoryId + ExpireDate filtering (status/expiry queries)
            // Query: WHERE CategoryId = ? AND (ExpireDate logic)
            // This is the most common filter pattern in GetPagedAsync
            builder.HasIndex(x => new { x.CategoryId, x.ExpireDate })
                .HasDatabaseName("IX_FILES_CategoryId_ExpireDate");

            // SECONDARY: Supports CategoryId + InputDate filtering (year-based queries)
            // Query: WHERE CategoryId = ? AND InputDate >= ? AND InputDate < ?
            // Better selectivity than separate IX_FILES_InputDate + using PK
            builder.HasIndex(x => new { x.CategoryId, x.InputDate })
                .HasDatabaseName("IX_FILES_CategoryId_InputDate");

            // SEARCH: File number lookup (CONTAINS/LIKE search)
            // Query: WHERE FileNumber.Contains(?)
            // Note: LIKE '%value%' cannot use index effectively, but LIKE 'value%' can
            builder.HasIndex(x => x.FileNumber)
                .HasDatabaseName("IX_FILES_FileNumber");

            // SEARCH: File name lookup (CONTAINS/LIKE search)
            // Query: WHERE FileName.Contains(?)
            // Acceptable for 100K+ records; consider full-text index at scale
            builder.HasIndex(x => x.FileName)
                .HasDatabaseName("IX_FILES_FileName");

            // FK INDEX: UploadedByUserId foreign key constraint
            // Query: Used for FK constraint validation + cascade delete operations
            // Auto-created by EF Core, explicitly defined here for clarity
            builder.HasIndex(x => x.UploadedByUserId)
                .HasDatabaseName("IX_FILES_UploadedByUserId");

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
