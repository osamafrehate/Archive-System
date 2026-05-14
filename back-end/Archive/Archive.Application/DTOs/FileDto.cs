using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Archive.Application.DTOs
{
    public class FileDto
    {
        public int Id { get; set; }

        public string FileNumber { get; set; } = null!;
        public string FileName { get; set; } = null!;

        public DateTime UploadedAt { get; set; }

        public DateTime? InputDate { get; set; }
        public DateTime? ExpireDate { get; set; }

        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = null!;
        public string UploadedByUsername { get; set; } = null!;

        public decimal? Amount { get; set; }

        public string Status { get; set; } = null!;
        public bool IsDeleted { get; set; }
    }
}
