using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Domain.Common
{
    public class BaseEntity
    {
        public int Id { get; protected set; }

        public DateTime CreatedAt { get; protected set; }
        public DateTime? UpdatedAt { get; protected set; }

        protected BaseEntity()
        {
            CreatedAt = DateTime.UtcNow;
        }

        protected void SetUpdated()
        {
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
