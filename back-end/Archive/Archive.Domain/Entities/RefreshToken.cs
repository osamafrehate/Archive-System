using Archive.Domain.Common;

namespace Archive.Domain.Entities
{
    public class RefreshToken : BaseEntity
    {
        public string Token { get; set; } = null!;
        public DateTime ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsRevoked { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;
    }
}

