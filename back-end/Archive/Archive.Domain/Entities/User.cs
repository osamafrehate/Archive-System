using Archive.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Domain.Entities
{
    public class User : BaseEntity
    {
        public string Username { get; private set; } = null!;
        public string PasswordHash { get; private set; } = null!;
        public bool IsActive { get; private set; }

        public ICollection<UserCategoryPermission> UserCategoryPermissions { get; private set; } = new List<UserCategoryPermission>();
        public ICollection<FileArchive> UploadedFiles { get; private set; } = new List<FileArchive>();

        private User() { }

        public User(string username, string passwordHash)
        {
            if (string.IsNullOrWhiteSpace(username))
                throw new ArgumentException("Username is required");

            if (string.IsNullOrWhiteSpace(passwordHash))
                throw new ArgumentException("Password hash is required");

            Username = username;
            PasswordHash = passwordHash;
            IsActive = true;
        }

        public void Deactivate() => IsActive = false;
        public void Activate() => IsActive = true;
    }
}
