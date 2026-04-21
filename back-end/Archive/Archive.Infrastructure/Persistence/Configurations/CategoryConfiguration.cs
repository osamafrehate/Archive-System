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
    public class CategoryConfiguration : IEntityTypeConfiguration<Category>
    {
        public void Configure(EntityTypeBuilder<Category> builder)
        {
            builder.ToTable("CATEGORIES");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name)
                .HasMaxLength(255)
                .IsRequired();

            builder.Property(x => x.IsActive)
                 .IsRequired()
                    .HasDefaultValue(true);

            builder.Property(x => x.CreatedAt)
                  .IsRequired()
                    .HasDefaultValueSql("GETUTCDATE()");

            builder.HasIndex(x => x.Name)
                     .IsUnique();
        }
    }
}
