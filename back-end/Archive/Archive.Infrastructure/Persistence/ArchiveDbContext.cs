using Archive.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Infrastructure.Persistence
{
    public class ArchiveDbContext : DbContext
    {
        public ArchiveDbContext(DbContextOptions<ArchiveDbContext> options)
        : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Permission> Permissions => Set<Permission>();
        public DbSet<FileArchive> Files => Set<FileArchive>();
        public DbSet<UserCategoryPermission> UserCategoryPermissions => Set<UserCategoryPermission>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ArchiveDbContext).Assembly);

        }
    }
}
