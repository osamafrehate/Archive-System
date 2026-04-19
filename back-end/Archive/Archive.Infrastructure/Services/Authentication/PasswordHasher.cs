using Archive.Application.Interfaces.Authentication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Infrastructure.Services.Authentication
{
    public class PasswordHasher : IPasswordHasher
    {
        public string Hash(string password)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        public bool Verify(string password, string hash)
        {
            return Hash(password) == hash;
        }
    }
}
