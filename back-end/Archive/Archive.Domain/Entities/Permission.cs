using Archive.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Domain.Entities
{
    public class Permission :BaseEntity
    {
        public string Name { get; private set; } = null!;
        public ICollection<UserCategoryPermission> UserCategoryPermissions { get; private set; } = new List<UserCategoryPermission>();

        private Permission() { }

        public Permission(string name)
        {
            SetName(name);
        }

        public void UpdateName(string name)
        {
            SetName(name);
            SetUpdated();
        }

        private void SetName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Permission name is required");

            Name = name;
        }
    }
}
