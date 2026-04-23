using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Domain.Entities
{
    public class UserCategoryPermission
    {
        public int UserId { get; private set; }
        public int CategoryId { get; private set; }
        public int PermissionId { get; private set; }

        public User User { get; private set; } = null!;
        public Category Category { get; private set; } = null!;
        public Permission Permission { get; private set; } = null!;
        
        private UserCategoryPermission() { }

        public UserCategoryPermission(int userId, int categoryId, int permissionId)
        {
            if (userId <= 0 || categoryId <= 0 || permissionId <= 0)
                throw new ArgumentException("Invalid relation");

            UserId = userId;
            CategoryId = categoryId;
            PermissionId = permissionId;
        }
    }
}
