using Archive.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Domain.Entities
{
    public class Category : BaseEntity
    {
        public string Name { get; private set; } = null!;
        public bool IsActive { get; private set; }

        public ICollection<UserCategoryPermission> UserCategoryPermissions { get; private set; } = new List<UserCategoryPermission>();
        public ICollection<FileArchive> Files { get; private set; } = new List<FileArchive>();

        private Category() { }

        public Category(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Category name is required");

            Name = name;
            IsActive = true;
        }

        public void Deactivate() => IsActive = false;
        public void Activate() => IsActive = true;
    }
}
