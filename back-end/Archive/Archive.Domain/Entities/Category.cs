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
        public ICollection<FileArchive> Files { get; private set; } = new List<FileArchive>();
        public ICollection<UserCategoryPermission> UserCategoryPermissions { get; private set; } = new List<UserCategoryPermission>();

        private Category() { }

        public Category(string name)
        {
            SetName(name);
            IsActive = true;
        }

        public void UpdateName(string name)
        {
            SetName(name);
            SetUpdated();
        }

        private void SetName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Category name is required");

            Name = name;
        }

        public void Deactivate()
        {
            IsActive = false;
            SetUpdated();
        }
    }
}
